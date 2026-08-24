export function showToast(message, type = 'info') {
  const region = document.querySelector('#toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  region.append(toast);

  window.setTimeout(() => toast.remove(), 4200);
}

export function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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

export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) {
    throw new Error('Копирование не поддерживается браузером.');
  }
}

export function formatImportError(error) {
  const detail = error?.message ? ` ${error.message}` : '';
  return `Не удалось импортировать BPMN XML.${detail}`;
}
