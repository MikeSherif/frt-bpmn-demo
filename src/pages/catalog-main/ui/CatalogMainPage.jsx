import { useState } from 'react';
import { useAuth } from '@/app/AuthContext';
import { filterFunctions } from '@/entities/function-item';
import { CatalogSearch } from '@/features/catalog-search';
import { CatalogFilters } from '@/features/catalog-filters';
import { DirectionCards } from '@/features/direction-cards';
import { FunctionTable } from '@/features/function-table';
import { FunctionForm } from '@/features/function-form';
import { DirectionForm } from '@/features/direction-form';
import { ExportButton } from '@/features/xlsx-export';
import { Button } from '@/shared/ui';
import { useCatalogTick } from '@/shared/lib/catalogSync';
import styles from './CatalogMainPage.module.css';

export function CatalogMainPage() {
  const { isAdmin } = useAuth();
  useCatalogTick();
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDirForm, setShowDirForm] = useState(false);
  const [editDirection, setEditDirection] = useState(null);
  const [filters, setFilters] = useState({});
  const [, setRefresh] = useState(0);

  const hasFilters = Object.keys(filters).length > 0;
  const filteredFunctions = hasFilters ? filterFunctions(filters) : [];
  const bump = () => setRefresh((v) => v + 1);

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Каталог функций Фонда</h1>
      </div>

      <div className={styles.toolbar}>
        <CatalogSearch />
        <CatalogFilters
          visible={showFilters}
          onToggle={() => setShowFilters((v) => !v)}
          onApply={setFilters}
        />
      </div>

      <div className={styles.actions}>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Создать функцию</Button>
        )}
        {isAdmin && (
          <Button variant="secondary" onClick={() => { setEditDirection(null); setShowDirForm(true); }}>
            + Направление
          </Button>
        )}
        <ExportButton filters={filters} />
      </div>

      {hasFilters ? (
        <FunctionTable
          functions={filteredFunctions}
          title="Результаты фильтрации"
        />
      ) : (
        <DirectionCards
          isAdmin={isAdmin}
          onEdit={(dir) => { setEditDirection(dir); setShowDirForm(true); }}
          onChanged={bump}
        />
      )}

      {showCreate && (
        <FunctionForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onSaved={bump}
        />
      )}

      {showDirForm && (
        <DirectionForm
          key={editDirection?.id ?? 'new'}
          open={showDirForm}
          editItem={editDirection}
          onClose={() => { setShowDirForm(false); setEditDirection(null); }}
          onSaved={bump}
        />
      )}
    </div>
  );
}
