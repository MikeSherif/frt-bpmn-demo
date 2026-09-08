import { demoProcessXml } from '@/entities/bpmn-process';
import { BpmnViewerCanvas } from '@/features/bpmn-viewer';
import { Capabilities } from '@/widgets/capabilities';
import styles from './ViewerPage.module.css';

export function ViewerPage() {
  return (
    <>
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">BPMN 2.0 VIEWER</span>
          <h1>Просмотр процесса</h1>
          <p>Интерактивная схема без возможности изменения модели</p>
        </div>
        <span className={styles.badge}>
          <i className={styles.badgeDot} /> Demo loaded
        </span>
      </div>
      <BpmnViewerCanvas xml={demoProcessXml} />
      <Capabilities />
    </>
  );
}
