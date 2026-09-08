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
