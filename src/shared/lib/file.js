export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Файл не выбран.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать выбранный файл.'));
    reader.onabort = () => reject(new Error('Чтение файла было отменено.'));
    reader.readAsText(file);
  });
}

export function formatImportError(error) {
  const detail = error?.message ? ` ${error.message}` : '';
  return `Не удалось импортировать BPMN XML.${detail}`;
}

export function isValidBpmnXml(text) {
  if (!text || typeof text !== 'string') return false;
  const xml = text.trim();
  if (!xml.startsWith('<')) return false;
  return /<([a-zA-Z0-9]+:)?definitions[\s>]/i.test(xml) && /bpmn/i.test(xml);
}
