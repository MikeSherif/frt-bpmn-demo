import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';
import { getDirectionById } from '@/entities/direction';
import { getFunctionsByDirection } from '@/entities/function-item';
import { FunctionTable } from '@/features/function-table';
import { FunctionForm } from '@/features/function-form';
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { Button } from '@/shared/ui';
import styles from './DirectionPage.module.css';

export function DirectionPage() {
  const { directionId } = useParams();
  const { isAdmin } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const direction = getDirectionById(directionId);
  if (!direction) return <Navigate to="/" replace />;

  const functions = getFunctionsByDirection(directionId);

  const crumbs = [
    { label: 'Каталог функций Фонда', to: '/' },
    { label: direction.name },
  ];

  return (
    <div className={styles.page} key={refresh}>
      <Breadcrumbs items={crumbs} />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{direction.name}</h1>
          <p className={styles.sub}>Функций 1-го уровня: {functions.length}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Добавить функцию</Button>
        )}
      </div>

      <FunctionTable
        functions={functions}
        title={`Функции 1-го уровня`}
      />

      {showCreate && (
        <FunctionForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          editItem={null}
          onSaved={() => setRefresh((v) => v + 1)}
        />
      )}
    </div>
  );
}
