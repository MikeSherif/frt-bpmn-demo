import { Button, IconButton } from '@/shared/ui';

export function ViewerToolbar({ zoom, onZoomIn, onZoomOut, onFit, onReset, onFullscreen }) {
  return (
    <div className="toolbar" aria-label="Инструменты просмотра">
      <div className="toolbar-group">
        <IconButton title="Увеличить" onClick={onZoomIn}>+</IconButton>
        <IconButton title="Уменьшить" onClick={onZoomOut}>−</IconButton>
        <Button onClick={onFit}>Fit</Button>
        <Button onClick={onReset}>Reset</Button>
        <Button onClick={onFullscreen}>⛶ Fullscreen</Button>
      </div>
      <span className="zoom-value">
        Zoom: <strong>{Math.round(zoom * 100)}%</strong>
      </span>
    </div>
  );
}
