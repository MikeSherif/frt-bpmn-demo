import { INITIAL_FUNCTIONS } from './data';

const STORAGE_KEY = 'catalog:functions';

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_FUNCTIONS.map((f) => ({ ...f }));
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_FUNCTIONS.map((f) => ({ ...f }));
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllFunctions() {
  return readAll();
}

export function getFunctionById(id) {
  return readAll().find((f) => f.id === id) || null;
}

export function getFunctionsByDirection(directionId) {
  return readAll().filter(
    (f) => f.directionId === Number(directionId) && f.level === 1 && f.status !== 'Архивная',
  );
}

export function getChildFunctions(parentId) {
  return readAll().filter((f) => f.parentId === parentId && f.status !== 'Архивная');
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
    items = items.filter((f) => f.bpmnXml !== null);
  }
  if (filters.hasBpmn === false) {
    items = items.filter((f) => f.bpmnXml === null);
  }
  if (filters.status) {
    items = items.filter((f) => f.status === filters.status);
  }

  return items;
}

export function addFunction(func) {
  const all = readAll();
  const newItem = {
    ...func,
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

export function deleteFunction(id) {
  const all = readAll();
  const filtered = all.filter((f) => f.id !== id);
  writeAll(filtered);
}

export function resetFunctions() {
  localStorage.removeItem(STORAGE_KEY);
}
