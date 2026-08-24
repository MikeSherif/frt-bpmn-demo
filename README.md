# BPMN Demo

Демонстрационный frontend-проект, показывающий две возможности BPMN в веб-приложении:

- интерактивный просмотр существующих BPMN 2.0-схем;
- создание и полноценное редактирование схем непосредственно в браузере.

Проект построен на HTML5, CSS3 и обычном JavaScript (ES6+). Vite используется только как dev server и bundler. React, Vue, Angular, TypeScript, jQuery и собственный BPMN renderer не используются.

## GitHub Pages

GitHub Pages **не запускает `npm install`**. На сайт попадает только результат `npm run build` (папка `docs/`).

### Настройка Pages

В **Settings → Pages → Build and deployment → Source** должно быть выбрано:

**GitHub Actions**

Workflow `.github/workflows/deploy.yml` собирает проект и публикует `docs/` через официальный `deploy-pages`.

Не используй `Deploy from a branch` + `main / (root)` — тогда GitHub отдаёт dev-версию `index.html` с `/src/js/app.js`.

После push в `main` дождись успешного workflow в **Actions** (1–2 мин), затем обнови страницу с очисткой кэша (`Cmd+Shift+R`).

Сайт: `https://mikesherif.github.io/frt-bpmn-demo/`

## Быстрый старт

Требуется актуальная LTS-версия Node.js.

```bash
npm install
npm run dev
```

Для production-сборки:

```bash
npm run build
npm run preview
```

## Что демонстрирует проект

### Viewer

Режим Viewer открывает встроенный процесс обработки заявки в read-only представлении. В нём доступны:

- zoom in / zoom out, fit to viewport и reset zoom;
- перемещение диаграммы мышью;
- полноэкранный режим;
- выбор BPMN-элемента;
- вывод типа, ID, названия и документации выбранного элемента.

Demo-процесс содержит pool и lanes, Start/End Events, User Tasks, Service Tasks, Exclusive и Parallel Gateways, условный и обычные Sequence Flows.

### Editor

Режим Editor использует стандартный BPMN Modeler:

- palette и context pad из `bpmn-js`;
- создание, удаление, перемещение и соединение элементов;
- изменение типа элементов;
- Undo / Redo;
- zoom и pan;
- properties panel с редактированием ID, Name, Documentation и других доступных стандартных BPMN-свойств;
- импорт `.bpmn`;
- экспорт BPMN XML и SVG;
- копирование XML и скачивание `.bpmn`;
- сохранение и восстановление через `localStorage`.

## Почему `bpmn-js`

`bpmn-js` — специализированная библиотека экосистемы bpmn.io для визуализации и моделирования BPMN 2.0. Она читает и сохраняет стандартный BPMN XML, предоставляет готовые canvas, palette, context pad, command stack, import/export API и расширяется модулями. Поэтому приложение не реализует собственный renderer, редактор или формат nodes/edges.

`bpmn-js-properties-panel` добавляет готовую панель свойств и стандартный BPMN provider.

## Viewer и Modeler

Viewer предназначен для просмотра. В Demo используется навигационный вариант Viewer, который добавляет pan и zoom, но не меняет BPMN-модель.

Modeler включает Viewer и инструменты моделирования: palette, создание shapes и connections, context actions, изменение модели и command stack для Undo/Redo. Его XML можно получить через `saveXML()`, а визуальное представление — через `saveSVG()`.

## Почему BPMN хранится в XML

BPMN 2.0 определяет стандартную XML-модель. Она содержит не только задачи и связи, но также типы элементов, свойства, документацию, расширения и BPMN Diagram Interchange — координаты shapes и waypoints.

Проект намеренно не преобразует модель в собственный JSON nodes/edges. Это сохраняет совместимость с Camunda Modeler и другими BPMN 2.0-инструментами.

## Mock API и localStorage

`src/js/storage.js` имитирует слой persistence. BPMN остаётся XML, а JSON используется только как транспортная API-обёртка:

```json
{
  "id": 1,
  "name": "Обработка заявки",
  "version": 3,
  "bpmnXml": "<?xml version=\"1.0\" ...",
  "updatedAt": "2026-08-24T07:30:00.000Z"
}
```

Кнопка **Save BPMN** получает форматированный XML, сохраняет новую локальную версию и показывает XML в modal. Отдельные команды позволяют сохранить, загрузить или удалить запись. При повторном открытии Editor автоматически восстанавливает сохранённую версию.

## Интеграция с backend

В production функции из `storage.js` можно заменить HTTP-клиентом:

```javascript
const { xml } = await modeler.saveXML({ format: true });

await fetch('/api/processes/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Обработка заявки', bpmnXml: xml }),
});
```

Для загрузки backend возвращает JSON, frontend извлекает `bpmnXml` и передаёт его в `viewer.importXML()` или `modeler.importXML()`. Backend может валидировать XML, хранить версии, права доступа, статусы публикации и audit log.

## Possible Production Architecture

```text
Frontend (bpmn-js)
   ↓
REST API
   ↓
JSON { metadata, bpmnXml }
   ↓
bpmnXml
   ↓
Database / Object Storage
```

Возможный поток:

1. `GET /api/processes/:id` возвращает метаданные и `bpmnXml`.
2. Frontend импортирует XML в Viewer или Modeler.
3. `PUT /api/processes/:id` создаёт новую версию XML.
4. Backend валидирует BPMN, сохраняет версию и возвращает обновлённые метаданные.
5. Опубликованная версия может передаваться workflow engine отдельно от draft-версии.

## Кастомные BPMN properties

Для бизнес-полей можно добавить:

1. собственный moddle descriptor с namespace и XML-атрибутами/extension elements;
2. custom properties provider для `bpmn-js-properties-panel`;
3. дополнительные groups и entries в панели;
4. backend-валидацию пользовательских extension properties.

Поля следует сохранять как BPMN extension elements, а не во внешнем nodes/edges JSON. Это позволяет переносить модель одним BPMN-файлом.

## Структура

```text
.
├── index.html
├── package.json
├── src
│   ├── css
│   │   ├── main.css
│   │   ├── viewer.css
│   │   └── editor.css
│   ├── data
│   │   └── demo-process.bpmn
│   └── js
│       ├── app.js
│       ├── viewer.js
│       ├── editor.js
│       ├── storage.js
│       └── utils.js
└── README.md
```

`app.js` отвечает за навигацию и modal, `viewer.js` — только за просмотр, `editor.js` — за Modeler и import/export, `storage.js` — за mock persistence, `utils.js` — за общие browser-операции и notifications.

## Ограничения PoC

- `localStorage` подходит только для Demo и имеет небольшой лимит объёма.
- Нет авторизации, совместного редактирования и серверного version control.
- В production рекомендуется серверная BPMN-валидация и Content Security Policy.
- Выполнение процесса workflow engine не входит в этот frontend PoC.
