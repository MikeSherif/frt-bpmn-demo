import { useNavigate } from 'react-router-dom';
import { DirectionCard, IconButton } from '@/shared/ui';
import { getDirections, archiveDirection, reorderDirections } from '@/entities/direction';
import { countFunctionsByDirection } from '@/entities/function-item';
import { useToast } from '@/shared/toast';
import styles from './DirectionCards.module.css';

export function DirectionCards({ isAdmin = false, onEdit, onChanged }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const directions = getDirections();

  const move = (index, delta) => {
    const next = index + delta;
    if (next < 0 || next >= directions.length) return;
    const ordered = [...directions];
    [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
    reorderDirections(ordered.map((d) => d.id));
    onChanged?.();
  };

  const handleArchive = (dir) => {
    if (!window.confirm(`Архивировать направление «${dir.name}»?`)) return;
    archiveDirection(dir.id);
    showToast('Направление архивировано', 'success');
    onChanged?.();
  };

  return (
    <section>
      <h2 className={styles.heading}>Направления деятельности Фонда</h2>
      <div className={styles.grid}>
        {directions.map((dir, index) => (
          <div key={dir.id} className={`${styles.cardWrap} ${isAdmin ? styles.cardWrapAdmin : ''}`}>
            {isAdmin && (
              <div className={styles.adminBar}>
                <IconButton
                  type="button"
                  disabled={index === 0}
                  title="Выше"
                  onClick={() => move(index, -1)}
                >
                  ↑
                </IconButton>
                <IconButton
                  type="button"
                  disabled={index === directions.length - 1}
                  title="Ниже"
                  onClick={() => move(index, 1)}
                >
                  ↓
                </IconButton>
                <IconButton type="button" title="Редактировать" onClick={() => onEdit?.(dir)}>
                  ✎
                </IconButton>
                <IconButton type="button" title="Архивировать" onClick={() => handleArchive(dir)}>
                  📦
                </IconButton>
              </div>
            )}
            <DirectionCard
              direction={dir}
              count={countFunctionsByDirection(dir.id)}
              onClick={() => navigate(`/direction/${dir.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
