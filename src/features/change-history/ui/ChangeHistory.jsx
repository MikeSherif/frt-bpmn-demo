import { getHistoryByFunction } from '@/entities/change-history';
import { EMPLOYEES } from '@/entities/user';
import { Table } from '@/shared/ui';
import styles from './ChangeHistory.module.css';

function getUserName(id) {
  return EMPLOYEES.find((e) => e.id === id)?.name || '—';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

const COLUMNS = [
  { key: 'date', title: 'Дата и время', width: '160px', render: (v) => formatDate(v) },
  { key: 'userId', title: 'Пользователь', width: '140px', render: (v) => getUserName(v) },
  { key: 'field', title: 'Поле', width: '140px' },
  { key: 'oldValue', title: 'Прежнее значение', render: (v) => <span className={styles.val}>{v || '—'}</span> },
  { key: 'newValue', title: 'Новое значение', render: (v) => <span className={styles.val}>{v || '—'}</span> },
];

export function ChangeHistory({ functionId }) {
  const history = getHistoryByFunction(functionId);

  return (
    <div>
      <Table
        columns={COLUMNS}
        data={history}
        emptyMessage="История изменений отсутствует"
      />
    </div>
  );
}
