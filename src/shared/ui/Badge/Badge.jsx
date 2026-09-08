import styles from './Badge.module.css';

const VARIANT_MAP = {
  'Действующая': 'success',
  'На актуализации': 'warning',
  'Архивная': 'muted',
  'Действующий': 'success',
  'На согласовании': 'warning',
};

export function Badge({ children, variant }) {
  const resolvedVariant = variant || VARIANT_MAP[children] || 'default';
  return (
    <span className={`${styles.badge} ${styles[resolvedVariant] || ''}`}>
      {children}
    </span>
  );
}
