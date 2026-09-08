import styles from './Button.module.css';

export function Button({ variant = 'primary', className = '', children, ...rest }) {
  const cls = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    className,
  ].filter(Boolean).join(' ');

  return <button className={cls} {...rest}>{children}</button>;
}

export function IconButton({ className = '', children, ...rest }) {
  return (
    <button className={`${styles.iconButton} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function TextButton({ danger, className = '', children, ...rest }) {
  const cls = [styles.textButton, danger && styles.danger, className]
    .filter(Boolean).join(' ');

  return <button className={cls} {...rest}>{children}</button>;
}
