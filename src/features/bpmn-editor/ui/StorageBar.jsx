import { TextButton } from '@/shared/ui';
import styles from './StorageBar.module.css';

export function StorageBar({ onSave, onLoad, onClear }) {
  return (
    <div className={styles.bar}>
      <span>
        <strong>Mock API / localStorage</strong>
        <small>BPMN XML хранится внутри JSON-обёртки</small>
      </span>
      <div className="toolbar-group">
        <TextButton onClick={onSave}>Save to LocalStorage</TextButton>
        <TextButton onClick={onLoad}>Load from LocalStorage</TextButton>
        <TextButton danger onClick={onClear}>Clear Storage</TextButton>
      </div>
    </div>
  );
}
