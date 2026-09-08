import { useCallback } from 'react';
import { demoProcessXml } from '@/entities/bpmn-process';
import { BpmnEditorCanvas } from '@/features/bpmn-editor';
import { Capabilities } from '@/widgets/capabilities';
import { useXmlModal } from '@/app/XmlModalContext';
import styles from './EditorPage.module.css';

export function EditorPage() {
  const openXmlModal = useXmlModal();

  const handleXmlSaved = useCallback(
    (xml) => openXmlModal(xml),
    [openXmlModal],
  );

  return (
    <>
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">BPMN 2.0 MODELER</span>
          <h1>Редактор процесса</h1>
          <p>Создание, настройка, импорт и экспорт BPMN-моделей</p>
        </div>
        <span className={styles.badge}>
          <i className={styles.badgeDot} /> Editing mode
        </span>
      </div>
      <BpmnEditorCanvas demoXml={demoProcessXml} onXmlSaved={handleXmlSaved} />
      <Capabilities />
    </>
  );
}
