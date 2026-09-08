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

export function FunctionTable({ functions, title, showDescription = true }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(functions.length / PAGE_SIZE);
  const paged = useMemo(
    () => functions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [functions, page],
  );

  const columns = [
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
