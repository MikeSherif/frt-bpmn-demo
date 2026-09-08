import styles from './Input.module.css';

export function Input({ label, id, className, ...props }) {
  return (
    <div className={`${styles.field} ${className || ''}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input id={id} className={styles.input} {...props} />
    </div>
  );
}

export function Textarea({ label, id, className, ...props }) {
  return (
    <div className={`${styles.field} ${className || ''}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <textarea id={id} className={`${styles.input} ${styles.textarea}`} {...props} />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Поиск...', onClear, onFocus }) {
  return (
    <div className={styles.searchWrap}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
      />
      {value && (
        <button className={styles.clearBtn} onClick={onClear} type="button">✕</button>
      )}
    </div>
  );
}
