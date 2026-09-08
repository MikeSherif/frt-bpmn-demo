import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';
import { getDirectionById } from '@/entities/direction';
import { getFunctionsByDirection, reorderFunctions } from '@/entities/function-item';
import { FunctionTable } from '@/features/function-table';
import { FunctionForm } from '@/features/function-form';
import { DirectionForm } from '@/features/direction-form';
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { Button } from '@/shared/ui';
import { useCatalogTick } from '@/shared/lib/catalogSync';
import styles from './DirectionPage.module.css';

export function DirectionPage() {
  const { directionId } = useParams();
  const { isAdmin } = useAuth();
  useCatalogTick();
  const [showCreate, setShowCreate] = useState(false);
  const [showDirEdit, setShowDirEdit] = useState(false);
  const [, setRefresh] = useState(0);

  const direction = getDirectionById(directionId);
  if (!direction) return <Navigate to="/" replace />;

  const functions = getFunctionsByDirection(directionId);
  const bump = () => setRefresh((v) => v + 1);

  const crumbs = [
    { label: 'Каталог функций Фонда', to: '/' },
    { label: direction.name },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={crumbs} />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{direction.name}</h1>
          <p className={styles.sub}>Функций 1-го уровня: {functions.length}</p>
        </div>
        {isAdmin && (
          <div className={styles.adminBtns}>
            <Button variant="secondary" onClick={() => setShowDirEdit(true)}>✏️ Направление</Button>
            <Button onClick={() => setShowCreate(true)}>+ Добавить функцию</Button>
          </div>
        )}
      </div>

      <FunctionTable
        functions={functions}
        title="Функции 1-го уровня"
        sortable={isAdmin}
        onReorder={(ids) => { reorderFunctions(ids); bump(); }}
      />

      {showCreate && (
        <FunctionForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          editItem={null}
          onSaved={bump}
        />
      )}

      {showDirEdit && (
        <DirectionForm
          open={showDirEdit}
          editItem={direction}
          onClose={() => setShowDirEdit(false)}
          onSaved={bump}
        />
      )}
    </div>
  );
}
