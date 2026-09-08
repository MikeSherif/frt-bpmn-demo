import styles from './Capabilities.module.css';

const ITEMS = [
  'BPMN 2.0 Viewer', 'BPMN 2.0 Modeler', 'Drag & Drop',
  'BPMN Properties', 'Import BPMN', 'Export BPMN',
  'Export SVG', 'XML storage', 'Zoom / Pan',
  'Undo / Redo', 'API integration concept',
];

export function Capabilities() {
  return (
    <section className={styles.section}>
      <div>
        <span className="eyebrow">PROOF OF CONCEPT</span>
        <h2>BPMN Demo Capabilities</h2>
      </div>
      <ul className={styles.list}>
        {ITEMS.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
