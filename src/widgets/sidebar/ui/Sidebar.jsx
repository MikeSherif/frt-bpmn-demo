import { NavLink } from 'react-router-dom';
import { getDirections } from '@/entities/direction';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const directions = getDirections();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Главная
        </NavLink>
      </div>
      <div className={styles.section}>
        {directions.map((dir) => (
          <NavLink
            key={dir.id}
            to={`/direction/${dir.id}`}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            {dir.name}
          </NavLink>
        ))}
      </div>
      <div className={styles.section}>
        <NavLink to="/" className={styles.link}>Справка</NavLink>
      </div>
    </aside>
  );
}
