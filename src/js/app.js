import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import '../css/main.css';
import '../css/viewer.css';
import '../css/editor.css';
import demoXml from '../data/demo-process.bpmn?raw';

import { EditorController } from './editor.js';
import { copyText, downloadText, showToast } from './utils.js';
import { ViewerController } from './viewer.js';

const modeButtons = [...document.querySelectorAll('.mode-tab')];
const modal = document.querySelector('#xml-modal');
const xmlOutput = document.querySelector('#xml-output');

let activeMode = '';
let activeController = null;
let switching = false;

async function switchMode(mode) {
  if (switching || mode === activeMode) return;
  switching = true;

  activeController?.destroy();
  activeController = null;

  document.querySelector('#viewer-mode').hidden = mode !== 'viewer';
  document.querySelector('#editor-mode').hidden = mode !== 'editor';
  modeButtons.forEach((button) => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
  });

  activeMode = mode;
  activeController = mode === 'viewer'
    ? new ViewerController(demoXml)
    : new EditorController(demoXml, { onXmlSaved: openXmlModal });

  try {
    await activeController.init();
  } catch (error) {
    showToast(`Не удалось открыть режим: ${error.message}`, 'error');
  } finally {
    switching = false;
  }
}

function openXmlModal(xml) {
  xmlOutput.value = xml;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelector('#xml-modal-close').focus();
}

function closeXmlModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => switchMode(button.dataset.mode));
});

document.querySelector('#xml-modal-close').addEventListener('click', closeXmlModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeXmlModal();
});

document.querySelector('#xml-copy').addEventListener('click', async () => {
  try {
    await copyText(xmlOutput.value);
    showToast('BPMN XML скопирован.', 'success');
  } catch (error) {
    showToast(`Не удалось скопировать XML: ${error.message}`, 'error');
  }
});

document.querySelector('#xml-download').addEventListener('click', () => {
  try {
    downloadText(xmlOutput.value, 'application-process.bpmn', 'application/xml;charset=utf-8');
    showToast('BPMN-файл скачан.', 'success');
  } catch (error) {
    showToast(`Не удалось скачать BPMN: ${error.message}`, 'error');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeXmlModal();
});

window.addEventListener('beforeunload', () => activeController?.destroy());

switchMode('viewer');
