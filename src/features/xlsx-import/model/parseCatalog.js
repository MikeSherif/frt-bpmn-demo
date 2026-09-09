const HEADER_MAP = {
  'направление деятельности': 'direction',
  'направление': 'direction',
  'код': 'id',
  'уровень': 'level',
  'наименование функции': 'name',
  'наименование': 'name',
  'родительская функция': 'parentId',
  'родительская': 'parentId',
  'описание': 'description',
  'результат': 'result',
  'нпа регулирующий функцию': 'npa',
  'нпа': 'npa',
  'ответственное подразделение': 'department',
  'подразделение': 'department',
  'ответственный': 'responsible',
  'наличие bpmn': 'hasBpmn',
  'связанные внд': 'vnds',
  'внд': 'vnds',
  'статус': 'status',
};

function decodeXml(str) {
  return String(str ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function normalizeHeader(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function looksLikeZip(text) {
  return text.charCodeAt(0) === 0x50 && text.charCodeAt(1) === 0x4b;
}

function parseSpreadsheetMl(xml) {
  const rows = [];
  const rowRe = /<Row\b[^>]*>([\s\S]*?)<\/Row>/gi;
  let rowMatch;
  while ((rowMatch = rowRe.exec(xml))) {
    const cells = [];
    const cellRe = /<Cell\b([^>]*)>([\s\S]*?)<\/Cell>/gi;
    let cellMatch;
    let cursor = 0;
    while ((cellMatch = cellRe.exec(rowMatch[1]))) {
      const attrs = cellMatch[1] || '';
      const indexMatch = attrs.match(/ss:Index="(\d+)"/i);
      const index = indexMatch ? Number(indexMatch[1]) - 1 : cursor;
      while (cells.length < index) cells.push('');
      const dataMatch = cellMatch[2].match(/<Data\b[^>]*>([\s\S]*?)<\/Data>/i);
      cells[index] = decodeXml(dataMatch ? dataMatch[1] : cellMatch[2]);
      cursor = index + 1;
    }
    if (cells.some((c) => c)) rows.push(cells);
  }
  return rows;
}

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || '';
  const delimiter = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      if (row.some((c) => c)) rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  row.push(cell.trim());
  if (row.some((c) => c)) rows.push(row);
  return rows;
}

function mapRows(rawRows) {
  if (!rawRows.length) {
    throw new Error('Файл не содержит строк данных.');
  }

  const headerKeys = rawRows[0].map((h) => HEADER_MAP[normalizeHeader(h)] || null);
  if (!headerKeys.includes('id') || !headerKeys.includes('name')) {
    throw new Error('Не найдены обязательные колонки «Код» и «Наименование функции». Используйте файл выгрузки Каталога или шаблон с теми же заголовками.');
  }

  return rawRows.slice(1).map((cells, index) => {
    const record = { _row: index + 2 };
    headerKeys.forEach((key, i) => {
      if (!key) return;
      record[key] = String(cells[i] ?? '').trim();
    });
    return record;
  }).filter((record) => record.id || record.name);
}

export function parseCatalogFile(text, fileName = '') {
  const source = String(text || '').replace(/^\uFEFF/, '');
  const name = fileName.toLowerCase();
  if (looksLikeZip(source) || name.endsWith('.xlsx')) {
    throw new Error('Файл .xlsx в бинарном формате Excel не поддерживается. Сохраните его как CSV или «XML Spreadsheet 2003», либо используйте файл, выгруженный из Каталога.');
  }

  const rawRows = /<Workbook[\s>]|<Worksheet[\s>]/i.test(source)
    ? parseSpreadsheetMl(source)
    : parseCsv(source);

  return mapRows(rawRows);
}
