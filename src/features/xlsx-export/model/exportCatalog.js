import { getAllFunctions, filterFunctions } from '@/entities/function-item';
import { getDirectionById } from '@/entities/direction';
import { getAllVnds } from '@/entities/vnd';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';

function getDeptName(id) {
  return DEPARTMENTS.find((d) => d.id === id)?.name || '';
}
function getEmpName(id) {
  return EMPLOYEES.find((e) => e.id === id)?.name || '';
}

function escapeXml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportToXlsx(filters = {}) {
  const funcs = Object.keys(filters).length > 0 ? filterFunctions(filters) : getAllFunctions();
  const allVnds = getAllVnds();

  const headers = [
    'Направление деятельности', 'Код', 'Уровень', 'Наименование функции',
    'Родительская функция', 'Описание', 'Результат', 'НПА регулирующий функцию',
    'Ответственное подразделение', 'Ответственный',
    'Наличие BPMN', 'Связанные ВНД', 'Статус',
  ];

  const rows = funcs.map((f) => {
    const dir = getDirectionById(f.directionId);
    const vnds = allVnds.filter((v) => v.functionIds.includes(f.id)).map((v) => v.name).join('; ');
    return [
      dir?.name || '', f.id, f.level, f.name,
      f.parentId || '', f.description || '', f.result || '', f.npa || '',
      getDeptName(f.departmentId), getEmpName(f.responsibleId),
      f.bpmnXml ? 'Да' : 'Нет', vnds, f.status,
    ];
  });

  const xmlRows = [headers, ...rows]
    .map(
      (row) =>
        '<Row>' +
        row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('') +
        '</Row>',
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Каталог функций">
    <Table>
      ${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Каталог_функций.xls';
  a.click();
  URL.revokeObjectURL(url);
}
