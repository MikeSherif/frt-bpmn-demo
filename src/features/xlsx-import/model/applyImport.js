import { getAllFunctions, addFunction, updateFunction, STATUSES } from '@/entities/function-item';
import { getAllDirections, addDirection, updateDirection } from '@/entities/direction';
import { getAllVnds, linkVndToFunction } from '@/entities/vnd';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';
import { addHistoryEntry } from '@/entities/change-history';

function norm(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function findByName(list, name) {
  const q = norm(name);
  if (!q) return null;
  return list.find((item) => norm(item.name) === q) || null;
}

function parseLevel(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

function parseVndNames(value) {
  return String(value || '')
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function resolveStatus(value) {
  if (!value) return 'Действующая';
  const found = STATUSES.find((s) => norm(s) === norm(value));
  return found || null;
}

export function buildImportPlan(records) {
  const functions = getAllFunctions();
  const directions = getAllDirections().filter((d) => d.status !== 'archived');
  const vnds = getAllVnds();
  const fileIds = new Set();

  const rows = records.map((raw) => {
    const warnings = [];
    const errors = [];
    const id = String(raw.id || '').trim();
    const name = String(raw.name || '').trim();
    const level = parseLevel(raw.level);
    const parentId = String(raw.parentId || '').trim() || null;

    if (!id) errors.push('Не указан код функции');
    if (!name) errors.push('Не указано наименование');
    if (id && fileIds.has(id)) errors.push('Код дублируется в файле');
    if (id) fileIds.add(id);
    if (level !== 1 && level !== 2) errors.push('Уровень должен быть 1 или 2');
    if (level === 2 && !parentId) errors.push('Для функции 2-го уровня нужна родительская функция');

    const status = resolveStatus(raw.status);
    if (raw.status && !status) errors.push(`Неизвестный статус «${raw.status}»`);

    const createDirection = Boolean(raw.direction && !findByName(directions, raw.direction));
    if (!raw.direction) errors.push('Не указано направление деятельности');
    if (createDirection) warnings.push(`Направление «${raw.direction}» будет создано`);

    const department = findByName(DEPARTMENTS, raw.department);
    if (raw.department && !department) warnings.push(`Подразделение «${raw.department}» не найдено в справочнике`);

    const responsible = findByName(EMPLOYEES, raw.responsible);
    if (raw.responsible && !responsible) warnings.push(`Ответственный «${raw.responsible}» не найден в справочнике`);

    const existing = functions.find((f) => f.id === id) || null;
    if (level === 2 && parentId) {
      const parentInFile = records.some((r) => String(r.id || '').trim() === parentId);
      const parentExists = functions.some((f) => f.id === parentId) || parentInFile;
      if (!parentExists) errors.push(`Родительская функция «${parentId}» не найдена`);
    }

    const vndNames = parseVndNames(raw.vnds);
    const linkedVnds = [];
    vndNames.forEach((vndName) => {
      const vnd = findByName(vnds, vndName);
      if (vnd) linkedVnds.push(vnd);
      else warnings.push(`ВНД «${vndName}» не найден в справочнике — связь не будет создана`);
    });

    if (raw.hasBpmn) {
      warnings.push('Колонка «Наличие BPMN» информационная: XML-схема из Excel не загружается');
    }

    const action = errors.length ? 'error' : existing ? 'update' : 'create';
    return {
      action,
      row: raw._row,
      id,
      name,
      errors,
      warnings,
      payload: {
        id,
        name,
        description: raw.description || '',
        result: raw.result || '',
        npa: raw.npa || '',
        level: level === 2 ? 2 : 1,
        directionName: raw.direction || '',
        createDirection,
        parentId: level === 2 ? parentId : null,
        departmentId: department?.id ?? null,
        responsibleId: responsible?.id ?? null,
        status: status || 'Действующая',
        vndIds: linkedVnds.map((v) => v.id),
      },
    };
  });

  const valid = rows.filter((r) => r.action !== 'error').length;
  return {
    rows,
    summary: {
      total: rows.length,
      create: rows.filter((r) => r.action === 'create').length,
      update: rows.filter((r) => r.action === 'update').length,
      error: rows.filter((r) => r.action === 'error').length,
      valid,
    },
  };
}

function ensureDirection(name, cache) {
  const existing = cache.find((d) => norm(d.name) === norm(name));
  if (existing && existing.status === 'archived') {
    const restored = updateDirection(existing.id, { status: 'active' });
    const item = restored || { ...existing, status: 'active' };
    const idx = cache.findIndex((d) => d.id === existing.id);
    if (idx !== -1) cache[idx] = item;
    return item;
  }
  if (existing) return existing;
  const created = addDirection({ name, icon: 'briefcase' });
  cache.push(created);
  return created;
}

export function applyImportPlan(plan) {
  const directionCache = getAllDirections();
  const ordered = [...plan.rows.filter((r) => r.action !== 'error')].sort((a, b) => a.payload.level - b.payload.level);
  let created = 0;
  let updated = 0;

  ordered.forEach((row) => {
    const direction = ensureDirection(row.payload.directionName, directionCache);
    const data = {
      id: row.payload.id,
      name: row.payload.name,
      description: row.payload.description,
      result: row.payload.result,
      npa: row.payload.npa || '',
      level: row.payload.level,
      directionId: direction.id,
      parentId: row.payload.parentId,
      departmentId: row.payload.departmentId,
      responsibleId: row.payload.responsibleId,
      status: row.payload.status,
    };

    if (row.action === 'create') {
      addFunction({ ...data, bpmnXml: null });
      addHistoryEntry({
        functionId: data.id,
        field: '(импорт)',
        oldValue: '',
        newValue: 'Функция создана из Excel',
      });
      created += 1;
    } else {
      const current = getAllFunctions().find((f) => f.id === data.id);
      const result = updateFunction(data.id, data);
      if (result) {
        const { oldItem, newItem } = result;
        Object.keys(data).forEach((key) => {
          if (String(oldItem[key] ?? '') !== String(newItem[key] ?? '')) {
            addHistoryEntry({
              functionId: data.id,
              field: key,
              oldValue: String(oldItem[key] ?? ''),
              newValue: String(newItem[key] ?? ''),
            });
          }
        });
      }
      if (current) updated += 1;
    }

    row.payload.vndIds.forEach((vndId) => {
      linkVndToFunction(vndId, data.id);
    });
  });

  return { created, updated, skipped: plan.summary.error };
}
