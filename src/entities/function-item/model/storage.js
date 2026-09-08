import { INITIAL_FUNCTIONS } from './data';
import { getAllVnds } from '@/entities/vnd';
import { notifyCatalogChanged } from '@/shared/lib/catalogSync';

const STORAGE_KEY = 'catalog:functions';
const DATA_VERSION_KEY = 'catalog:functions:version';
const CURRENT_VERSION = '3';

function siblingKey(f) {
  return f.parentId ? `p:${f.parentId}` : `d:${f.directionId}:l:${f.level}`;
}

function assignSortOrders(items) {
  const groups = new Map();
  items.forEach((f) => {
    const key = siblingKey(f);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  });
  groups.forEach((group) => {
    group.forEach((f, i) => {
      if (f.sortOrder == null) f.sortOrder = i + 1;
    });
  });
  return items;
}

function bySortOrder(a, b) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.id).localeCompare(String(b.id), 'ru');
}

function hasBpmnXml(func) {
  return Boolean(func.bpmnXml);
}

function readAll() {
  const ver = localStorage.getItem(DATA_VERSION_KEY);
  if (ver !== CURRENT_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
    return assignSortOrders(INITIAL_FUNCTIONS.map((f) => ({ ...f })));
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return assignSortOrders(INITIAL_FUNCTIONS.map((f) => ({ ...f })));
  try {
    return assignSortOrders(JSON.parse(raw));
  } catch {
    return assignSortOrders(INITIAL_FUNCTIONS.map((f) => ({ ...f })));
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyCatalogChanged();
}

export function getAllFunctions() {
  return readAll();
}

export function getFunctionById(id) {
  return readAll().find((f) => f.id === id) || null;
}

export function getFunctionsByDirection(directionId) {
  return readAll()
    .filter((f) => f.directionId === Number(directionId) && f.level === 1 && f.status !== 'Архивная')
    .sort(bySortOrder);
}

export function getChildFunctions(parentId) {
  return readAll()
    .filter((f) => f.parentId === parentId && f.status !== 'Архивная')
    .sort(bySortOrder);
}

export function countFunctionsByDirection(directionId) {
  return readAll().filter(
    (f) => f.directionId === Number(directionId) && f.level === 1 && f.status !== 'Архивная',
  ).length;
}

export function searchFunctions(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return readAll().filter(
    (f) =>
      f.id.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q)),
  );
}

export function filterFunctions(filters) {
  let items = readAll();

  if (filters.directionId) {
    items = items.filter((f) => f.directionId === Number(filters.directionId));
  }
  if (filters.level) {
    items = items.filter((f) => f.level === Number(filters.level));
  }
  if (filters.departmentId) {
    items = items.filter((f) => f.departmentId === Number(filters.departmentId));
  }
  if (filters.responsibleId) {
    items = items.filter((f) => f.responsibleId === Number(filters.responsibleId));
  }
  if (filters.hasBpmn === true) {
    items = items.filter((f) => hasBpmnXml(f));
  }
  if (filters.hasBpmn === false) {
    items = items.filter((f) => !hasBpmnXml(f));
  }
  if (filters.hasVnd === true || filters.hasVnd === false) {
    const withVnd = new Set();
    getAllVnds().forEach((v) => (v.functionIds || []).forEach((id) => withVnd.add(id)));
    items = items.filter((f) => (filters.hasVnd === true ? withVnd.has(f.id) : !withVnd.has(f.id)));
  }
  if (filters.status) {
    items = items.filter((f) => f.status === filters.status);
  }

  return items.sort(bySortOrder);
}

export function addFunction(func) {
  const all = readAll();
  const siblings = all.filter((f) => siblingKey(f) === siblingKey(func));
  const maxOrder = siblings.reduce((max, f) => Math.max(max, f.sortOrder ?? 0), 0);
  const newItem = {
    ...func,
    sortOrder: func.sortOrder ?? maxOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 12,
  };
  all.push(newItem);
  writeAll(all);
  return newItem;
}

export function updateFunction(id, changes) {
  const all = readAll();
  const idx = all.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const oldItem = { ...all[idx] };
  all[idx] = {
    ...all[idx],
    ...changes,
    updatedAt: new Date().toISOString(),
    updatedBy: 12,
  };
  writeAll(all);
  return { oldItem, newItem: all[idx] };
}

export function archiveFunction(id) {
  return updateFunction(id, { status: 'Архивная' });
}

export function reorderFunctions(orderedIds) {
  const all = readAll();
  orderedIds.forEach((id, index) => {
    const item = all.find((f) => f.id === id);
    if (item) item.sortOrder = index + 1;
  });
  writeAll(all);
}

export function deleteFunction(id) {
  const all = readAll();
  const filtered = all.filter((f) => f.id !== id);
  writeAll(filtered);
}

export function resetFunctions() {
  localStorage.removeItem(STORAGE_KEY);
}
