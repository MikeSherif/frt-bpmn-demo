import { Link } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { role, toggleRole } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>КФ</span>
          <div className={styles.brandText}>
            <span className={styles.brandName}>Каталог функций Фонда</span>
            <span className={styles.brandSub}>Внутренний корпоративный портал</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Каталог</Link>
        </nav>

        <div className={styles.right}>
          <button
            className={`${styles.roleBtn} ${role === 'admin' ? styles.adminActive : ''}`}
            onClick={toggleRole}
            type="button"
            title={role === 'admin' ? 'Режим администратора' : 'Режим просмотра'}
          >
            {role === 'admin' ? '🔧 Администратор' : '👁 Пользователь'}
          </button>
          <span className={styles.user}>Иванова И.И.</span>
        </div>
      </div>
    </header>
  );
}
