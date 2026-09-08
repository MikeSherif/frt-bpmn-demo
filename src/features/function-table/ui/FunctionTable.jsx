import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Pagination } from '@/shared/ui';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';
import styles from './FunctionTable.module.css';

const PAGE_SIZE = 10;

function getDeptName(id) {
  return DEPARTMENTS.find((d) => d.id === id)?.name || '—';
}
function getEmpName(id) {
  return EMPLOYEES.find((e) => e.id === id)?.name || '—';
}

export function FunctionTable({ functions, title, showDescription = true, sortable = false, onReorder }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(functions.length / PAGE_SIZE);
  const paged = useMemo(
    () => functions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [functions, page],
  );

  const move = (index, delta) => {
    const next = index + delta;
    if (next < 0 || next >= functions.length) return;
    const ordered = [...functions];
    [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
    onReorder?.(ordered.map((f) => f.id));
  };

  const columns = [
    ...(sortable
      ? [{
          key: 'sortOrder',
          title: '',
          width: '72px',
          render: (_, row) => {
            const idx = functions.findIndex((f) => f.id === row.id);
            return (
              <div className={styles.orderBtns} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={styles.orderBtn}
                  disabled={idx <= 0}
                  onClick={() => move(idx, -1)}
                  title="Выше"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.orderBtn}
                  disabled={idx >= functions.length - 1}
                  onClick={() => move(idx, 1)}
                  title="Ниже"
                >
                  ↓
                </button>
              </div>
            );
          },
        }]
      : []),
    { key: 'id', title: 'Код', width: '100px' },
    { key: 'name', title: 'Наименование функции' },
    ...(showDescription
      ? [{ key: 'description', title: 'Описание', render: (v) => <span className={styles.desc}>{v}</span> }]
      : []),
    {
      key: 'departmentId',
      title: 'Ответственное подразделение',
      render: (v) => getDeptName(v),
    },
    {
      key: 'responsibleId',
      title: 'Ответственный',
      render: (v) => getEmpName(v),
    },
    {
      key: 'status',
      title: 'Статус',
      width: '140px',
      render: (v) => <Badge>{v}</Badge>,
    },
  ];

  return (
    <div>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.total}>Всего: {functions.length}</span>
        </div>
      )}
      <Table
        columns={columns}
        data={paged}
        onRowClick={(row) => navigate(`/function/${row.id}`)}
        emptyMessage="Функции не найдены"
      />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
