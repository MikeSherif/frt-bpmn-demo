import { useState } from 'react';
import { Select, Button } from '@/shared/ui';
import { getDirections } from '@/entities/direction';
import { STATUSES } from '@/entities/function-item';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';
import styles from './CatalogFilters.module.css';

const EMPTY = {
  directionId: '',
  level: '',
  departmentId: '',
  responsibleId: '',
  hasBpmn: '',
  hasVnd: '',
  status: '',
};

export function CatalogFilters({ onApply, visible, onToggle }) {
  const [filters, setFilters] = useState(EMPTY);
  const directions = getDirections();

  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApply = () => {
    const parsed = { ...filters };
    if (parsed.hasBpmn === 'true') parsed.hasBpmn = true;
    else if (parsed.hasBpmn === 'false') parsed.hasBpmn = false;
    else delete parsed.hasBpmn;

    if (parsed.hasVnd === 'true') parsed.hasVnd = true;
    else if (parsed.hasVnd === 'false') parsed.hasVnd = false;
    else delete parsed.hasVnd;

    Object.keys(parsed).forEach((k) => {
      if (parsed[k] === '') delete parsed[k];
    });
    onApply(parsed);
  };

  const handleReset = () => {
    setFilters(EMPTY);
    onApply({});
  };

  return (
    <div>
      <Button variant="secondary" onClick={onToggle} className={styles.toggleBtn}>
        🔽 Фильтры
      </Button>

      {visible && (
        <div className={styles.panel}>
          <div className={styles.grid}>
            <Select
              label="Направление"
              options={directions.map((d) => ({ value: d.id, label: d.name }))}
              value={filters.directionId}
              onChange={handleChange('directionId')}
            />
            <Select
              label="Уровень функции"
              options={[
                { value: '1', label: '1-й уровень' },
                { value: '2', label: '2-й уровень' },
              ]}
              value={filters.level}
              onChange={handleChange('level')}
            />
            <Select
              label="Подразделение"
              options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))}
              value={filters.departmentId}
              onChange={handleChange('departmentId')}
            />
            <Select
              label="Ответственный"
              options={EMPLOYEES.map((e) => ({ value: e.id, label: e.name }))}
              value={filters.responsibleId}
              onChange={handleChange('responsibleId')}
            />
            <Select
              label="Наличие BPMN"
              options={[
                { value: 'true', label: 'Есть BPMN' },
                { value: 'false', label: 'Нет BPMN' },
              ]}
              value={filters.hasBpmn}
              onChange={handleChange('hasBpmn')}
            />
            <Select
              label="Наличие ВНД"
              options={[
                { value: 'true', label: 'Есть ВНД' },
                { value: 'false', label: 'Нет ВНД' },
              ]}
              value={filters.hasVnd}
              onChange={handleChange('hasVnd')}
            />
            <Select
              label="Статус"
              options={STATUSES.map((s) => ({ value: s, label: s }))}
              value={filters.status}
              onChange={handleChange('status')}
            />
          </div>
          <div className={styles.actions}>
            <Button onClick={handleApply}>Применить</Button>
            <Button variant="secondary" onClick={handleReset}>Сбросить</Button>
          </div>
        </div>
      )}
    </div>
  );
}
