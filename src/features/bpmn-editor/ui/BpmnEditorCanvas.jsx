import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/shared/toast';
import { readTextFile, formatImportError } from '@/shared/lib/file';
import { downloadText } from '@/shared/lib/download';
import { saveProcess, getProcess, clearProcess } from '@/entities/bpmn-process';
import { useBpmnModeler } from '../model/useBpmnModeler';
import { EditorToolbar } from './EditorToolbar';
import { StorageBar } from './StorageBar';
import styles from './BpmnEditorCanvas.module.css';

export function BpmnEditorCanvas({ demoXml, onXmlSaved }) {
  const { showToast } = useToast();
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  const [initialXml, setInitialXml] = useState(() => {
    try {
      const saved = getProcess();
      return saved ? saved.bpmnXml : demoXml;
    } catch {
      return demoXml;
    }
  });

  const {
    canUndo, canRedo, importXml, getXml, getSvg,
    undo, redo, zoomIn, zoomOut, fit,
  } = useBpmnModeler(containerRef, panelRef, initialXml);

  const handleImportClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    try {
      const xml = await readTextFile(file);
      const ok = await importXml(xml);
      if (ok) showToast(`Файл «${file.name}» импортирован.`, 'success');
      else showToast('Не удалось импортировать файл.', 'error');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }, [importXml, showToast]);

  const handleLoadDemo = useCallback(async () => {
    const ok = await importXml(demoXml);
    if (ok) showToast('Demo-схема загружена.', 'success');
  }, [demoXml, importXml, showToast]);

  const handleSave = useCallback(async () => {
    try {
      const xml = await getXml();
      const process = saveProcess(xml);
      onXmlSaved?.(xml);
      showToast(`BPMN сохранён, версия ${process.version}.`, 'success');
    } catch (error) {
      showToast(`Ошибка сохранения: ${error.message}`, 'error');
    }
  }, [getXml, onXmlSaved, showToast]);

  const handleExportSvg = useCallback(async () => {
    try {
      const svg = await getSvg();
      downloadText(svg, 'application-process.svg', 'image/svg+xml;charset=utf-8');
      showToast('SVG экспортирован.', 'success');
    } catch (error) {
      showToast(`Ошибка экспорта SVG: ${error.message}`, 'error');
    }
  }, [getSvg, showToast]);

  const handleStorageSave = useCallback(async () => {
    try {
      const xml = await getXml();
      const process = saveProcess(xml);
      showToast(`Сохранено в localStorage, версия ${process.version}.`, 'success');
    } catch (error) {
      showToast(`Не удалось сохранить: ${error.message}`, 'error');
    }
  }, [getXml, showToast]);

  const handleStorageLoad = useCallback(async () => {
    try {
      const process = getProcess();
      if (!process) {
        showToast('В localStorage пока нет сохранённого процесса.', 'info');
        return;
      }
      const ok = await importXml(process.bpmnXml);
      if (ok) showToast(`Загружена версия ${process.version}.`, 'success');
    } catch (error) {
      showToast(`Не удалось загрузить: ${error.message}`, 'error');
    }
  }, [importXml, showToast]);

  const handleStorageClear = useCallback(() => {
    try {
      clearProcess();
      showToast('Локальное сохранение удалено.', 'success');
    } catch (error) {
      showToast(`Не удалось очистить: ${error.message}`, 'error');
    }
  }, [showToast]);

  return (
    <>
      <EditorToolbar
        onImport={handleImportClick}
        onLoadDemo={handleLoadDemo}
        onSave={handleSave}
        onExportSvg={handleExportSvg}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFit={fit}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".bpmn,.xml,text/xml,application/xml"
        hidden
        onChange={handleFileChange}
      />
      <StorageBar
        onSave={handleStorageSave}
        onLoad={handleStorageLoad}
        onClear={handleStorageClear}
      />
      <div className={styles.layout}>
        <div className={styles.diagramCard}>
          <div className={styles.canvas} ref={containerRef} />
        </div>
        <aside className={styles.propertiesPanel} ref={panelRef} />
      </div>
    </>
  );
}
