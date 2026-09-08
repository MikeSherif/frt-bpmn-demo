import { INITIAL_HISTORY } from './data';

const STORAGE_KEY = 'catalog:history';

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_HISTORY.map((h) => ({ ...h }));
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_HISTORY.map((h) => ({ ...h }));
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getHistoryByFunction(functionId) {
  return readAll()
    .filter((h) => h.functionId === functionId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function addHistoryEntry(entry) {
  const all = readAll();
  const maxId = all.reduce((max, h) => Math.max(max, h.id), 0);
  const newEntry = {
    ...entry,
    id: maxId + 1,
    date: new Date().toISOString(),
    userId: 12,
  };
  all.push(newEntry);
  writeAll(all);
  return newEntry;
}

export function resetHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
