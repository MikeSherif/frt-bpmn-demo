import { useCallback, useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/shared/config/bpmn';

export function useBpmnModeler(containerRef, propertiesPanelRef, initialXml) {
  const modelerRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const containerNode = containerRef.current;
    const panelNode = propertiesPanelRef.current;
    if (!containerNode || !panelNode || !initialXml) return;

    let disposed = false;
    containerNode.innerHTML = '';
    panelNode.innerHTML = '';

    const modeler = new BpmnModeler({
      container: containerNode,
      propertiesPanel: { parent: panelNode },
      additionalModules: [BpmnPropertiesPanelModule, BpmnPropertiesProviderModule],
    });
    modelerRef.current = modeler;

    const eventBus = modeler.get('eventBus');
    eventBus.on('commandStack.changed', () => {
      if (disposed) return;
      const cs = modeler.get('commandStack');
      setCanUndo(cs.canUndo());
      setCanRedo(cs.canRedo());
    });

    modeler.importXML(initialXml).then(() => {
      if (!disposed) modeler.get('canvas').zoom('fit-viewport');
    }).catch(() => {});

    return () => {
      disposed = true;
      modelerRef.current = null;
      modeler.destroy();
    };
  }, [initialXml, containerRef, propertiesPanelRef]);

  const importXml = useCallback(async (xml) => {
    const modeler = modelerRef.current;
    if (!modeler || !xml?.trim()) return false;
    try {
      await modeler.importXML(xml);
      modeler.get('canvas').zoom('fit-viewport');
      return true;
    } catch {
      return false;
    }
  }, []);

  const getXml = useCallback(async () => {
    if (!modelerRef.current) throw new Error('Редактор не инициализирован.');
    const { xml } = await modelerRef.current.saveXML({ format: true });
    if (!xml) throw new Error('Редактор вернул пустой BPMN XML.');
    return xml;
  }, []);

  const getSvg = useCallback(async () => {
    if (!modelerRef.current) throw new Error('Редактор не инициализирован.');
    const { svg } = await modelerRef.current.saveSVG();
    if (!svg) throw new Error('Редактор вернул пустой SVG.');
    return svg;
  }, []);

  const undo = useCallback(() => modelerRef.current?.get('commandStack').undo(), []);
  const redo = useCallback(() => modelerRef.current?.get('commandStack').redo(), []);

  const zoomIn = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) canvas.zoom(Math.min(MAX_ZOOM, canvas.zoom() * ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) canvas.zoom(Math.max(MIN_ZOOM, canvas.zoom() / ZOOM_STEP));
  }, []);

  const fit = useCallback(() => {
    modelerRef.current?.get('canvas').zoom('fit-viewport');
  }, []);

  return { modeler: modelerRef, canUndo, canRedo, importXml, getXml, getSvg, undo, redo, zoomIn, zoomOut, fit };
}
