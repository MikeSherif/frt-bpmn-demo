import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export function Breadcrumbs({ items }) {
  return (
    <nav className={styles.nav}>
      {items.map((item, i) => (
        <span key={i} className={styles.item}>
          {i > 0 && <span className={styles.sep}>/</span>}
          {item.to ? (
            <Link to={item.to} className={styles.link}>{item.label}</Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
