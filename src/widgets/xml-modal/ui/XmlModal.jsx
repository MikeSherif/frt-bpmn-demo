import { useCallback, useEffect } from 'react';
import { Button } from '@/shared/ui';
import { useToast } from '@/shared/toast';
import { copyText } from '@/shared/lib/clipboard';
import { downloadText } from '@/shared/lib/download';
import styles from './XmlModal.module.css';

export function XmlModal({ xml, onClose }) {
  const showToast = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await copyText(xml);
      showToast('BPMN XML скопирован.', 'success');
    } catch (error) {
      showToast(`Не удалось скопировать: ${error.message}`, 'error');
    }
  }, [xml, showToast]);

  const handleDownload = useCallback(() => {
    try {
      downloadText(xml, 'application-process.bpmn', 'application/xml;charset=utf-8');
      showToast('BPMN-файл скачан.', 'success');
    } catch (error) {
      showToast(`Не удалось скачать: ${error.message}`, 'error');
    }
  }, [xml, showToast]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose],
  );

  if (!xml) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <section className={styles.modal} role="dialog" aria-modal="true">
        <header className={styles.modalHeader}>
          <div>
            <span className="eyebrow">BPMN XML</span>
            <h2 className={styles.modalTitle}>Схема готова к сохранению</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <textarea className={styles.textarea} readOnly spellCheck={false} value={xml} />
        <footer className={styles.modalFooter}>
          <span>Стандартный BPMN 2.0 XML</span>
          <div className="toolbar-group">
            <Button onClick={handleCopy}>Copy</Button>
            <Button variant="primary" onClick={handleDownload}>Download .bpmn</Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
