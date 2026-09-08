import { useState } from 'react';
import { getAllVnds, getVndsByFunction, linkVndToFunction, unlinkVndFromFunction } from '@/entities/vnd';
import { addHistoryEntry } from '@/entities/change-history';
import { Button, Modal, Select, TextButton } from '@/shared/ui';
import { useToast } from '@/shared/toast';
import styles from './VndPanel.module.css';

export function VndPanel({ functionId, isAdmin = false, onChanged }) {
  const { showToast } = useToast();
  const [showLink, setShowLink] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const vnds = getVndsByFunction(functionId);
  const available = getAllVnds().filter((v) => !v.functionIds.includes(functionId));

  const handleLink = () => {
    if (!selectedId) {
      showToast('Выберите документ', 'error');
      return;
    }
    const vnd = linkVndToFunction(Number(selectedId), functionId);
    if (vnd) {
      addHistoryEntry({
        functionId,
        field: 'vnd',
        oldValue: '',
        newValue: `Добавлен: «${vnd.name}»`,
      });
      showToast('ВНД привязан к функции', 'success');
    }
    setSelectedId('');
    setShowLink(false);
    onChanged?.();
  };

  const handleUnlink = (vnd) => {
    if (!window.confirm(`Отвязать документ «${vnd.name}»?`)) return;
    unlinkVndFromFunction(vnd.id, functionId);
    addHistoryEntry({
      functionId,
      field: 'vnd',
      oldValue: `Удалён: «${vnd.name}»`,
      newValue: '',
    });
    showToast('Связь с ВНД удалена', 'success');
    onChanged?.();
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>ВНД, регламентирующие функцию</h3>
        {isAdmin && (
          <TextButton type="button" onClick={() => setShowLink(true)}>
            + Привязать
          </TextButton>
        )}
      </div>
      {vnds.length === 0 ? (
        <p className={styles.empty}>ВНД, регламентирующие функцию, не определены</p>
      ) : (
        <div className={styles.list}>
          {vnds.map((vnd) => (
            <div key={vnd.id} className={styles.card}>
              <a
                href={vnd.url}
                className={styles.cardLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (vnd.url === '#') e.preventDefault(); }}
              >
                <span className={styles.vndName}>{vnd.name}</span>
                <span className={styles.meta}>
                  {vnd.number} от {vnd.date}
                </span>
                <span className={styles.vndStatus}>{vnd.status}</span>
              </a>
              {isAdmin && (
                <button
                  type="button"
                  className={styles.unlink}
                  onClick={() => handleUnlink(vnd)}
                >
                  Отвязать
                </button>
              )}
            </div>
          ))}
          <p className={styles.allLink}>Все документы ({vnds.length})</p>
        </div>
      )}

      {showLink && (
        <Modal open={showLink} onClose={() => setShowLink(false)} title="Привязать ВНД">
          {available.length === 0 ? (
            <p className={styles.empty}>Все доступные ВНД уже привязаны</p>
          ) : (
            <div className={styles.linkForm}>
              <Select
                label="Документ"
                options={available.map((v) => ({ value: v.id, label: `${v.number} — ${v.name}` }))}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              />
              <div className={styles.linkActions}>
                <Button type="button" onClick={handleLink}>Привязать</Button>
                <Button type="button" variant="secondary" onClick={() => setShowLink(false)}>Отмена</Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </aside>
  );
}
