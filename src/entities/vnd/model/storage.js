import { INITIAL_VNDS } from './data';

const STORAGE_KEY = 'catalog:vnds';

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_VNDS.map((v) => ({ ...v }));
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_VNDS.map((v) => ({ ...v }));
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllVnds() {
  return readAll();
}

export function getVndsByFunction(functionId) {
  return readAll().filter((v) => v.functionIds.includes(functionId));
}

export function getVndById(id) {
  return readAll().find((v) => v.id === Number(id)) || null;
}

export function addVnd(vnd) {
  const all = readAll();
  const maxId = all.reduce((max, v) => Math.max(max, v.id), 0);
  const newItem = { ...vnd, id: maxId + 1 };
  all.push(newItem);
  writeAll(all);
  return newItem;
}

export function updateVnd(id, changes) {
  const all = readAll();
  const idx = all.findIndex((v) => v.id === Number(id));
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...changes };
  writeAll(all);
  return all[idx];
}

export function linkVndToFunction(vndId, functionId) {
  const all = readAll();
  const vnd = all.find((v) => v.id === Number(vndId));
  if (!vnd) return null;
  if (!vnd.functionIds.includes(functionId)) {
    vnd.functionIds.push(functionId);
  }
  writeAll(all);
  return vnd;
}

export function unlinkVndFromFunction(vndId, functionId) {
  const all = readAll();
  const vnd = all.find((v) => v.id === Number(vndId));
  if (!vnd) return null;
  vnd.functionIds = vnd.functionIds.filter((id) => id !== functionId);
  writeAll(all);
  return vnd;
}

export function resetVnds() {
  localStorage.removeItem(STORAGE_KEY);
}
