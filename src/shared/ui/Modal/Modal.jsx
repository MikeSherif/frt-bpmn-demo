import { useEffect, useCallback } from 'react';
import styles from './Modal.module.css';

export function Modal({ open, onClose, title, children, wide }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.dialog} ${wide ? styles.wide : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
