import { useState } from 'react';
import { useAuth } from '@/app/AuthContext';
import { CatalogSearch } from '@/features/catalog-search';
import { CatalogFilters } from '@/features/catalog-filters';
import { DirectionCards } from '@/features/direction-cards';
import { FunctionForm } from '@/features/function-form';
import { ExportButton } from '@/features/xlsx-export';
import { Button } from '@/shared/ui';
import styles from './CatalogMainPage.module.css';

export function CatalogMainPage() {
  const { isAdmin } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [, setRefresh] = useState(0);

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
          onApply={() => {}}
        />
      </div>

      <div className={styles.actions}>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Создать функцию</Button>
        )}
        <ExportButton />
      </div>

      <DirectionCards />

      {showCreate && (
        <FunctionForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onSaved={() => setRefresh((v) => v + 1)}
        />
      )}
    </div>
  );
}
