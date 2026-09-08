import { useCallback, useEffect, useRef, useState } from 'react';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/shared/config/bpmn';

export function useBpmnViewer(containerRef, xml) {
  const viewerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !xml) return;

    let disposed = false;
    node.innerHTML = '';

    const viewer = new NavigatedViewer({ container: node });
    viewerRef.current = viewer;

    const eventBus = viewer.get('eventBus');

    eventBus.on('canvas.viewbox.changed', ({ viewbox }) => {
      if (!disposed) setZoom(viewbox.scale);
    });

    eventBus.on('element.click', ({ element }) => {
      if (!disposed) setSelectedElement(element.labelTarget || element);
    });

    viewer.importXML(xml).then(() => {
      if (!disposed) viewer.get('canvas').zoom('fit-viewport');
    }).catch(() => {});

    return () => {
      disposed = true;
      viewerRef.current = null;
      viewer.destroy();
    };
  }, [xml, containerRef]);

  const zoomIn = useCallback(() => {
    const canvas = viewerRef.current?.get('canvas');
    if (canvas) canvas.zoom(Math.min(MAX_ZOOM, canvas.zoom() * ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = viewerRef.current?.get('canvas');
    if (canvas) canvas.zoom(Math.max(MIN_ZOOM, canvas.zoom() / ZOOM_STEP));
  }, []);

  const fit = useCallback(() => {
    viewerRef.current?.get('canvas').zoom('fit-viewport');
  }, []);

  const resetZoom = useCallback(() => {
    const canvas = viewerRef.current?.get('canvas');
    if (canvas) canvas.zoom(1);
  }, []);

  return { viewer: viewerRef, zoom, selectedElement, zoomIn, zoomOut, fit, resetZoom };
}
