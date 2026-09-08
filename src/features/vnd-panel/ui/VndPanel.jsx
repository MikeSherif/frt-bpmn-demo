import { getVndsByFunction } from '@/entities/vnd';
import styles from './VndPanel.module.css';

export function VndPanel({ functionId }) {
  const vnds = getVndsByFunction(functionId);

  return (
    <aside className={styles.panel}>
      <h3 className={styles.title}>ВНД, регламентирующие функцию</h3>
      {vnds.length === 0 ? (
        <p className={styles.empty}>ВНД, регламентирующие функцию, не определены</p>
      ) : (
        <div className={styles.list}>
          {vnds.map((vnd) => (
            <a
              key={vnd.id}
              href={vnd.url}
              className={styles.card}
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
          ))}
          <p className={styles.allLink}>Все документы ({vnds.length})</p>
        </div>
      )}
    </aside>
  );
}
