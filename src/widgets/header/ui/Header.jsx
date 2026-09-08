import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const tabs = [
  { to: '/', label: 'Viewer' },
  { to: '/editor', label: 'Editor' },
];

export function Header() {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="#" aria-label="BPMN Demo">
        <span className={styles.brandMark}>B</span>
        <span>
          <strong className={styles.brandTitle}>BPMN Demo</strong>
          <small className={styles.brandSub}>Process workspace</small>
        </span>
      </a>
      <nav className={styles.tabs} aria-label="Режим приложения">
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.tabActive : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
