import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { formatImportError, showToast } from './utils.js';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.2;

export class ViewerController {
  constructor(xml) {
    this.xml = xml;
    this.viewer = null;
    this.selectedElement = null;
    this.onFullscreenChange = this.updateFullscreenButton.bind(this);
  }

  async init() {
    this.viewer = new BpmnViewer({ container: '#viewer-canvas' });
    this.bindToolbar();
    this.bindDiagramEvents();

    try {
      const { warnings = [] } = await this.viewer.importXML(this.xml);
      this.fit();
      if (warnings.length) {
        showToast(`Схема открыта с предупреждениями: ${warnings.length}`, 'info');
      }
    } catch (error) {
      showToast(formatImportError(error), 'error');
    }
  }

  bindToolbar() {
    document.querySelector('#viewer-zoom-in').onclick = () => this.changeZoom(ZOOM_STEP);
    document.querySelector('#viewer-zoom-out').onclick = () => this.changeZoom(1 / ZOOM_STEP);
    document.querySelector('#viewer-fit').onclick = () => this.fit();
    document.querySelector('#viewer-reset').onclick = () => this.setZoom(1);
    document.querySelector('#viewer-fullscreen').onclick = () => this.toggleFullscreen();
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  bindDiagramEvents() {
    const eventBus = this.viewer.get('eventBus');
    const canvas = this.viewer.get('canvas');

    eventBus.on('element.click', ({ element }) => {
      const target = element.labelTarget || element;
      if (this.selectedElement) {
        canvas.removeMarker(this.selectedElement, 'selected');
      }
      this.selectedElement = target;
      canvas.addMarker(target, 'selected');
      this.showElementInfo(target);
    });

    eventBus.on('canvas.viewbox.changed', ({ viewbox }) => {
      this.showZoom(viewbox.scale);
    });
  }

  showElementInfo(element) {
    const businessObject = element.businessObject;
    const documentation = businessObject?.documentation
      ?.map((item) => item.text)
      .filter(Boolean)
      .join('\n');

    document.querySelector('#selected-type').textContent = businessObject?.$type || element.type || '—';
    document.querySelector('#selected-id').textContent = businessObject?.id || element.id || '—';
    document.querySelector('#selected-name').textContent = businessObject?.name || 'Без названия';
    document.querySelector('#selected-documentation').textContent = documentation || '—';
  }

  changeZoom(factor) {
    const canvas = this.viewer?.get('canvas');
    if (!canvas) return;
    this.setZoom(canvas.zoom() * factor);
  }

  setZoom(value) {
    const canvas = this.viewer?.get('canvas');
    if (!canvas) return;
    canvas.zoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)));
  }

  fit() {
    const canvas = this.viewer?.get('canvas');
    canvas?.zoom('fit-viewport');
  }

  showZoom(scale) {
    const output = document.querySelector('#viewer-zoom-value');
    if (output && Number.isFinite(scale)) {
      output.textContent = `${Math.round(scale * 100)}%`;
    }
  }

  async toggleFullscreen() {
    const workspace = document.querySelector('#viewer-workspace');
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await workspace.requestFullscreen();
      }
      window.setTimeout(() => this.fit(), 100);
    } catch (error) {
      showToast(`Fullscreen недоступен: ${error.message}`, 'error');
    }
  }

  updateFullscreenButton() {
    const button = document.querySelector('#viewer-fullscreen');
    if (button) {
      button.textContent = document.fullscreenElement ? '⛶ Exit fullscreen' : '⛶ Fullscreen';
    }
  }

  destroy() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    this.viewer?.destroy();
    this.viewer = null;
  }
}
