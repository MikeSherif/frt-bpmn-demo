import { INITIAL_DIRECTIONS } from './data';

const STORAGE_KEY = 'catalog:directions';

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...INITIAL_DIRECTIONS];
  try {
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_DIRECTIONS];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getDirections() {
  return readAll().filter((d) => d.status !== 'archived').sort((a, b) => a.order - b.order);
}

export function getAllDirections() {
  return readAll().sort((a, b) => a.order - b.order);
}

export function getDirectionById(id) {
  return readAll().find((d) => d.id === Number(id)) || null;
}

export function addDirection(direction) {
  const all = readAll();
  const maxId = all.reduce((max, d) => Math.max(max, d.id), 0);
  const maxOrder = all.reduce((max, d) => Math.max(max, d.order), 0);
  const newItem = {
    ...direction,
    id: maxId + 1,
    order: maxOrder + 1,
    status: 'active',
  };
  all.push(newItem);
  writeAll(all);
  return newItem;
}

export function updateDirection(id, changes) {
  const all = readAll();
  const idx = all.findIndex((d) => d.id === Number(id));
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...changes };
  writeAll(all);
  return all[idx];
}

export function archiveDirection(id) {
  return updateDirection(id, { status: 'archived' });
}

export function reorderDirections(orderedIds) {
  const all = readAll();
  orderedIds.forEach((id, index) => {
    const item = all.find((d) => d.id === id);
    if (item) item.order = index + 1;
  });
  writeAll(all);
}

export function resetDirections() {
  localStorage.removeItem(STORAGE_KEY);
}
