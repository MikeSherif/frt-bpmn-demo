import { useCallback, useRef } from 'react';
import { useToast } from '@/shared/toast';
import { useBpmnViewer } from '../model/useBpmnViewer';
import { ViewerToolbar } from './ViewerToolbar';
import { ElementInfo } from './ElementInfo';
import styles from './BpmnViewerCanvas.module.css';

export function BpmnViewerCanvas({ xml }) {
  const { showToast } = useToast();
  const containerRef = useRef(null);
  const workspaceRef = useRef(null);
  const { zoom, selectedElement, zoomIn, zoomOut, fit, resetZoom } = useBpmnViewer(containerRef, xml);

  const handleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await workspaceRef.current?.requestFullscreen();
      }
      setTimeout(fit, 100);
    } catch (error) {
      showToast(`Fullscreen недоступен: ${error.message}`, 'error');
    }
  }, [fit, showToast]);

  return (
    <>
      <ViewerToolbar
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFit={fit}
        onReset={resetZoom}
        onFullscreen={handleFullscreen}
      />
      <div className={styles.layout}>
        <div className={styles.diagramCard} ref={workspaceRef}>
          <div className={styles.canvas} ref={containerRef} />
        </div>
        <aside className={styles.sidePanel}>
          <ElementInfo element={selectedElement} />
        </aside>
      </div>
    </>
  );
}
