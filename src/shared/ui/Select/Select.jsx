import styles from './Select.module.css';

export function Select({ label, id, options, placeholder = '— Все —', className, ...props }) {
  return (
    <div className={`${styles.field} ${className || ''}`}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <select id={id} className={styles.select} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
