import { useNavigate } from 'react-router-dom';
import { DirectionCard } from '@/shared/ui';
import { getDirections } from '@/entities/direction';
import { countFunctionsByDirection } from '@/entities/function-item';
import styles from './DirectionCards.module.css';

export function DirectionCards() {
  const navigate = useNavigate();
  const directions = getDirections();

  return (
    <section>
      <h2 className={styles.heading}>Направления деятельности Фонда</h2>
      <div className={styles.grid}>
        {directions.map((dir) => (
          <DirectionCard
            key={dir.id}
            direction={dir}
            count={countFunctionsByDirection(dir.id)}
            onClick={() => navigate(`/direction/${dir.id}`)}
          />
        ))}
      </div>
    </section>
  );
}
