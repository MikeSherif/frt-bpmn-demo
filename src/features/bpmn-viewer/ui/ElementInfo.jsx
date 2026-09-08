import { useMemo } from 'react';
import styles from './ElementInfo.module.css';

export function ElementInfo({ element }) {
  const info = useMemo(() => {
    if (!element) return null;
    const bo = element.businessObject;
    const documentation = bo?.documentation
      ?.map((item) => item.text)
      .filter(Boolean)
      .join('\n');

    return {
      type: bo?.$type || element.type || '—',
      id: bo?.id || element.id || '—',
      name: bo?.name || 'Без названия',
      documentation: documentation || '—',
    };
  }, [element]);

  return (
    <>
      <div className={styles.panelTitle}>
        <span className={styles.panelIcon}>⌁</span>
        <div>
          <h2>Выбранный элемент</h2>
          <p>Нажмите на элемент схемы</p>
        </div>
      </div>
      <dl className={styles.details}>
        {[
          ['Type', info?.type],
          ['ID', info?.id],
          ['Name', info?.name],
          ['Documentation', info?.documentation],
        ].map(([label, value]) => (
          <div key={label} className={styles.row}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
