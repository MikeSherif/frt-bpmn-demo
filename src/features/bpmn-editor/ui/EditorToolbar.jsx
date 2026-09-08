import { Button, IconButton } from '@/shared/ui';

export function EditorToolbar({
  onImport, onLoadDemo, onSave, onExportSvg,
  canUndo, canRedo, onUndo, onRedo,
  onZoomIn, onZoomOut, onFit,
}) {
  return (
    <div className="toolbar editor-toolbar" aria-label="Инструменты редактора">
      <div className="toolbar-group">
        <Button onClick={onImport}>↑ Import BPMN</Button>
        <Button onClick={onLoadDemo}>Load Demo</Button>
        <Button variant="primary" onClick={onSave}>Save BPMN</Button>
        <Button onClick={onExportSvg}>Export SVG</Button>
      </div>
      <span className="toolbar-divider" />
      <div className="toolbar-group">
        <IconButton title="Отменить" onClick={onUndo} disabled={!canUndo}>↶</IconButton>
        <IconButton title="Повторить" onClick={onRedo} disabled={!canRedo}>↷</IconButton>
        <IconButton title="Увеличить" onClick={onZoomIn}>+</IconButton>
        <IconButton title="Уменьшить" onClick={onZoomOut}>−</IconButton>
        <Button onClick={onFit}>Fit</Button>
      </div>
    </div>
  );
}
