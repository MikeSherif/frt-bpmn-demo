import styles from './Card.module.css';

const ICON_MAP = {
  building: '🏠',
  water: '💧',
  users: '👥',
  flag: '🏴',
  briefcase: '💼',
  map: '🗺️',
  settings: '⚙️',
};

export function DirectionCard({ direction, count, onClick }) {
  const icon = ICON_MAP[direction.icon] || '📁';
  return (
    <button className={styles.card} onClick={onClick} type="button">
      <div className={styles.iconRow}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.number}>{direction.order}</span>
      </div>
      <h3 className={styles.name}>{direction.name}</h3>
      <p className={styles.count}>Функций 1-го уровня: {count}</p>
    </button>
  );
}
