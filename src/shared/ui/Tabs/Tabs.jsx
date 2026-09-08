import styles from './Tabs.module.css';

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${active === tab.key ? styles.active : ''}`}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
