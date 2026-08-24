import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import { clearProcess, getProcess, saveProcess } from './storage.js';
import {
  downloadText,
  formatImportError,
  readTextFile,
  showToast,
} from './utils.js';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2;

export class EditorController {
  constructor(demoXml, { onXmlSaved } = {}) {
    this.demoXml = demoXml;
    this.onXmlSaved = onXmlSaved;
    this.modeler = null;
    this.fileInput = document.querySelector('#bpmn-file-input');
  }

  async init() {
    this.modeler = new BpmnModeler({
      container: '#editor-canvas',
      propertiesPanel: { parent: '#properties-panel' },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
      ],
    });

    this.bindToolbar();
    this.bindCommandStack();

    let initialXml = this.demoXml;
    try {
      const saved = getProcess();
      if (saved) {
        initialXml = saved.bpmnXml;
        showToast(`Восстановлена локальная версия ${saved.version}.`, 'success');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }

    await this.importXml(initialXml);
  }

  bindToolbar() {
    document.querySelector('#editor-import').onclick = () => {
      this.fileInput.value = '';
      this.fileInput.click();
    };
    this.fileInput.onchange = () => this.importFile(this.fileInput.files?.[0]);
    document.querySelector('#editor-load-demo').onclick = () => this.importXml(this.demoXml, 'Demo-схема загружена.');
    document.querySelector('#editor-save').onclick = () => this.saveAndShowXml();
    document.querySelector('#editor-export-svg').onclick = () => this.exportSvg();
    document.querySelector('#editor-undo').onclick = () => this.modeler.get('commandStack').undo();
    document.querySelector('#editor-redo').onclick = () => this.modeler.get('commandStack').redo();
    document.querySelector('#editor-zoom-in').onclick = () => this.changeZoom(ZOOM_STEP);
    document.querySelector('#editor-zoom-out').onclick = () => this.changeZoom(1 / ZOOM_STEP);
    document.querySelector('#editor-fit').onclick = () => this.fit();
    document.querySelector('#storage-save').onclick = () => this.saveToStorage();
    document.querySelector('#storage-load').onclick = () => this.loadFromStorage();
    document.querySelector('#storage-clear').onclick = () => this.clearStorage();
  }

  bindCommandStack() {
    const eventBus = this.modeler.get('eventBus');
    eventBus.on('commandStack.changed', () => this.updateHistoryButtons());
    this.updateHistoryButtons();
  }

  async importXml(xml, successMessage = '') {
    if (!xml?.trim()) {
      showToast('BPMN XML пуст.', 'error');
      return false;
    }

    try {
      const { warnings = [] } = await this.modeler.importXML(xml);
      this.fit();
      this.updateHistoryButtons();
      if (warnings.length) {
        showToast(`Импорт завершён с предупреждениями: ${warnings.length}`, 'info');
      } else if (successMessage) {
        showToast(successMessage, 'success');
      }
      return true;
    } catch (error) {
      showToast(formatImportError(error), 'error');
      return false;
    }
  }

  async importFile(file) {
    try {
      const xml = await readTextFile(file);
      await this.importXml(xml, `Файл «${file.name}» импортирован.`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async getXml() {
    if (!this.modeler) {
      throw new Error('Редактор не инициализирован.');
    }
    const { xml } = await this.modeler.saveXML({ format: true });
    if (!xml) {
      throw new Error('Редактор вернул пустой BPMN XML.');
    }
    return xml;
  }

  async saveAndShowXml() {
    try {
      const xml = await this.getXml();
      const process = saveProcess(xml);
      this.onXmlSaved?.(xml);
      showToast(`BPMN сохранён локально как версия ${process.version}.`, 'success');
    } catch (error) {
      showToast(`Ошибка сохранения: ${error.message}`, 'error');
    }
  }

  async saveToStorage() {
    try {
      const xml = await this.getXml();
      const process = saveProcess(xml);
      showToast(`Процесс сохранён в localStorage, версия ${process.version}.`, 'success');
    } catch (error) {
      showToast(`Не удалось сохранить процесс: ${error.message}`, 'error');
    }
  }

  async loadFromStorage() {
    try {
      const process = getProcess();
      if (!process) {
        showToast('В localStorage пока нет сохранённого процесса.', 'info');
        return;
      }
      const imported = await this.importXml(process.bpmnXml);
      if (imported) {
        showToast(`Загружена версия ${process.version} из localStorage.`, 'success');
      }
    } catch (error) {
      showToast(`Не удалось загрузить процесс: ${error.message}`, 'error');
    }
  }

  clearStorage() {
    try {
      clearProcess();
      showToast('Локальное сохранение удалено.', 'success');
    } catch (error) {
      showToast(`Не удалось очистить localStorage: ${error.message}`, 'error');
    }
  }

  async exportSvg() {
    try {
      const { svg } = await this.modeler.saveSVG();
      if (!svg) throw new Error('Редактор вернул пустой SVG.');
      downloadText(svg, 'application-process.svg', 'image/svg+xml;charset=utf-8');
      showToast('SVG экспортирован.', 'success');
    } catch (error) {
      showToast(`Ошибка экспорта SVG: ${error.message}`, 'error');
    }
  }

  changeZoom(factor) {
    const canvas = this.modeler?.get('canvas');
    if (!canvas) return;
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvas.zoom() * factor));
    canvas.zoom(nextZoom);
  }

  fit() {
    this.modeler?.get('canvas').zoom('fit-viewport');
  }

  updateHistoryButtons() {
    const commandStack = this.modeler?.get('commandStack');
    if (!commandStack) return;
    document.querySelector('#editor-undo').disabled = !commandStack.canUndo();
    document.querySelector('#editor-redo').disabled = !commandStack.canRedo();
  }

  destroy() {
    this.fileInput.onchange = null;
    this.modeler?.destroy();
    this.modeler = null;
    document.querySelector('#properties-panel').replaceChildren();
  }
}
