const STORAGE_KEY = 'bpmn-demo:process';

export function saveProcess(bpmnXml) {
  if (!bpmnXml || typeof bpmnXml !== 'string') {
    throw new Error('BPMN XML отсутствует.');
  }

  const previous = getProcess();
  const process = {
    id: previous?.id ?? 1,
    name: 'Обработка заявки',
    version: (previous?.version ?? 0) + 1,
    bpmnXml,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(process));
  return process;
}

export function getProcess() {
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) {
    return null;
  }

  try {
    const process = JSON.parse(serialized);
    if (!process.bpmnXml || typeof process.bpmnXml !== 'string') {
      throw new Error('Сохранённая запись не содержит bpmnXml.');
    }
    return process;
  } catch (error) {
    throw new Error(`Данные localStorage повреждены: ${error.message}`);
  }
}

export function clearProcess() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedProcess() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
