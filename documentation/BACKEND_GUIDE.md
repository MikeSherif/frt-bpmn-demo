# Руководство для бэкенд-разработчика

> Каталог функций Фонда — фронтенд-демо  
> Этот документ описывает контракт между фронтендом и будущим бэкендом: модель данных, необходимые API-эндпоинты, авторизацию и интеграционные точки.

---

## 1. Обзор

Фронтенд реализован на React (FSD-архитектура) и сейчас работает на mock-данных через localStorage. Весь слой работы с данными сосредоточен в `src/entities/*/model/storage.js` — это файлы, которые нужно заменить на HTTP-запросы к реальному API.

### Что менять при интеграции

```
src/entities/
├── direction/model/storage.js     ← заменить на fetch к /api/directions
├── function-item/model/storage.js ← заменить на fetch к /api/functions
├── vnd/model/storage.js           ← заменить на fetch к /api/vnds
├── change-history/model/storage.js ← заменить на fetch к /api/history
└── user/model/data.js             ← заменить на fetch к /api/users + /api/departments
```

Каждый файл `storage.js` экспортирует чистые функции (get, add, update, delete). При переходе на бэкенд достаточно заменить реализацию этих функций на `async fetch(...)` без изменения компонентов.

---

## 2. Модель данных

### 2.1. Direction (Направление деятельности)

```sql
CREATE TABLE directions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    icon        VARCHAR(50),           -- строковый ключ иконки: building, water, users, flag, briefcase, map, settings
    sort_order  INTEGER NOT NULL DEFAULT 0,
    status      VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | archived
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

**Пример данных:**

| id | name | icon | sort_order | status |
|---|---|---|---|---|
| 1 | Жилищная инфраструктура | building | 1 | active |
| 2 | Коммунальная инфраструктура | water | 2 | active |
| 3 | Дольщики | users | 3 | active |
| 4 | Восстановление воссоединённых регионов | flag | 4 | active |
| 5 | СЭЗ и Управление имуществом | briefcase | 5 | active |
| 6 | Развитие территорий | map | 6 | active |
| 7 | Сервисные направления | settings | 7 | active |

---

### 2.2. FunctionItem (Функция каталога)

```sql
CREATE TABLE functions (
    id              VARCHAR(20) PRIMARY KEY,  -- код функции, напр. "ЖИ-01", "ЖИ-01-02"
    name            VARCHAR(500) NOT NULL,
    description     TEXT,
    result          TEXT,                     -- результат выполнения функции
    npa             TEXT,                     -- НПА, регулирующий функцию
    level           SMALLINT NOT NULL,        -- 1 или 2 (расширяемо до 3+)
    direction_id    INTEGER NOT NULL REFERENCES directions(id),
    parent_id       VARCHAR(20) REFERENCES functions(id),  -- NULL для L1
    department_id   INTEGER REFERENCES departments(id),
    responsible_id  INTEGER REFERENCES employees(id),
    bpmn_xml        TEXT,                     -- полный BPMN 2.0 XML или NULL
    sort_order      INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'Действующая',
                    -- 'Действующая' | 'На актуализации' | 'Архивная'
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    updated_by      INTEGER REFERENCES employees(id)
);

CREATE INDEX idx_functions_direction ON functions(direction_id);
CREATE INDEX idx_functions_parent ON functions(parent_id);
CREATE INDEX idx_functions_status ON functions(status);
```

**Важно:**
- `id` — строковый, формируется по шаблону: `{КОД_НАПРАВЛЕНИЯ}-{НОМЕР}` для L1, `{КОД_L1}-{НОМЕР}` для L2
- `bpmn_xml` — полный XML документ BPMN 2.0 (может быть большим, до нескольких МБ)
- `parent_id` — NULL для функций 1-го уровня, ссылка на L1 для функций 2-го уровня
- `sort_order` — порядок внутри группы (направление+уровень или parent_id)

---

### 2.3. VND (Внутренний нормативный документ)

```sql
CREATE TABLE vnds (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(500) NOT NULL,
    doc_type    VARCHAR(100),          -- Положение, Регламент, Порядок, Стандарт, Методические рекомендации
    doc_number  VARCHAR(50),           -- "№ П-12"
    doc_date    DATE,
    status      VARCHAR(50) DEFAULT 'Действующий',  -- Действующий | На согласовании | Архивный
    url         TEXT,                  -- ссылка на документ в Базе знаний
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

**Связь M:N — функции ↔ ВНД:**

```sql
CREATE TABLE function_vnds (
    function_id VARCHAR(20) REFERENCES functions(id) ON DELETE CASCADE,
    vnd_id      INTEGER REFERENCES vnds(id) ON DELETE CASCADE,
    PRIMARY KEY (function_id, vnd_id)
);
```

---

### 2.4. Department (Подразделение)

```sql
CREATE TABLE departments (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL
);
```

### 2.5. Employee (Сотрудник)

```sql
CREATE TABLE employees (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,    -- "Петров П.П."
    position        VARCHAR(255),             -- "Директор департамента"
    department_id   INTEGER REFERENCES departments(id)
);
```

### 2.6. ChangeHistory (История изменений)

```sql
CREATE TABLE change_history (
    id              SERIAL PRIMARY KEY,
    function_id     VARCHAR(20) NOT NULL REFERENCES functions(id),
    changed_at      TIMESTAMP DEFAULT NOW(),
    changed_by      INTEGER NOT NULL REFERENCES employees(id),
    field_name      VARCHAR(100) NOT NULL,    -- имя поля или "(создание)"
    old_value       TEXT,
    new_value       TEXT
);

CREATE INDEX idx_history_function ON change_history(function_id);
CREATE INDEX idx_history_date ON change_history(changed_at DESC);
```

---

## 3. API-эндпоинты

### 3.1. Направления

| Метод | URL | Описание | Роль |
|---|---|---|---|
| `GET` | `/api/directions` | Список активных направлений (отсортировано по sort_order) | Все |
| `GET` | `/api/directions/:id` | Одно направление по ID | Все |
| `POST` | `/api/directions` | Создать направление | Админ |
| `PUT` | `/api/directions/:id` | Обновить направление | Админ |
| `PATCH` | `/api/directions/:id/archive` | Архивировать направление | Админ |
| `PUT` | `/api/directions/reorder` | Изменить порядок (body: `{ orderedIds: [3,1,2,...] }`) | Админ |

**GET /api/directions — ответ:**
```json
[
  { "id": 1, "name": "Жилищная инфраструктура", "icon": "building", "order": 1, "status": "active", "functionsCount": 5 }
]
```

> `functionsCount` — количество функций L1 (не архивных). Вычисляется на бэке, чтобы фронт не делал отдельный запрос для каждой карточки.

---

### 3.2. Функции

| Метод | URL | Описание | Роль |
|---|---|---|---|
| `GET` | `/api/functions` | Список функций с фильтрацией и пагинацией | Все |
| `GET` | `/api/functions/:id` | Одна функция по ID (с подразделением, ответственным) | Все |
| `GET` | `/api/functions/:id/children` | Дочерние функции (L2 для данной L1) | Все |
| `POST` | `/api/functions` | Создать функцию | Админ |
| `PUT` | `/api/functions/:id` | Обновить функцию | Админ |
| `PATCH` | `/api/functions/:id/archive` | Архивировать функцию | Админ |
| `PUT` | `/api/functions/:id/bpmn` | Загрузить/заменить BPMN XML (body: XML string или multipart file) | Админ |
| `DELETE` | `/api/functions/:id/bpmn` | Удалить BPMN-схему | Админ |
| `PUT` | `/api/functions/reorder` | Изменить порядок (body: `{ orderedIds: ["ЖИ-01", "ЖИ-02", ...] }`) | Админ |

**GET /api/functions — query-параметры:**

| Параметр | Тип | Описание |
|---|---|---|
| `directionId` | number | Фильтр по направлению |
| `level` | number | Фильтр по уровню (1 или 2) |
| `parentId` | string | Фильтр по родительской функции |
| `departmentId` | number | Фильтр по подразделению |
| `responsibleId` | number | Фильтр по ответственному |
| `hasBpmn` | boolean | Наличие BPMN-схемы |
| `hasVnd` | boolean | Наличие связанных ВНД |
| `status` | string | Фильтр по статусу |
| `search` | string | Полнотекстовый поиск (код, наименование, описание) |
| `page` | number | Номер страницы (default: 1) |
| `pageSize` | number | Размер страницы (default: 10) |

**GET /api/functions — ответ:**
```json
{
  "data": [
    {
      "id": "ЖИ-01",
      "name": "Формирование и реализация жилищной политики",
      "description": "...",
      "result": "...",
      "level": 1,
      "directionId": 1,
      "parentId": null,
      "department": { "id": 1, "name": "Департамент жилищной политики" },
      "responsible": { "id": 1, "name": "Петров П.П." },
      "hasBpmn": true,
      "status": "Действующая",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-06-20T14:30:00.000Z"
    }
  ],
  "total": 16,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

**GET /api/functions/:id — ответ (расширенный):**
```json
{
  "id": "ЖИ-01",
  "name": "Формирование и реализация жилищной политики",
  "description": "...",
  "result": "Утверждённая жилищная политика",
  "level": 1,
  "directionId": 1,
  "direction": { "id": 1, "name": "Жилищная инфраструктура" },
  "parentId": null,
  "parent": null,
  "department": { "id": 1, "name": "Департамент жилищной политики" },
  "responsible": { "id": 1, "name": "Петров П.П.", "position": "Директор департамента" },
  "bpmnXml": "<?xml version=\"1.0\" ...?>...",
  "status": "Действующая",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-06-20T14:30:00.000Z",
  "updatedBy": { "id": 12, "name": "Иванова И.И." }
}
```

> **Важно:** `bpmnXml` может быть большим (до нескольких МБ). Рекомендуется не включать его в списочный эндпоинт (`GET /api/functions`), а отдавать только в детальном (`GET /api/functions/:id`).

---

### 3.3. ВНД

| Метод | URL | Описание | Роль |
|---|---|---|---|
| `GET` | `/api/vnds` | Список всех ВНД | Все |
| `GET` | `/api/vnds?functionId=ЖИ-01` | ВНД, связанные с функцией | Все |
| `POST` | `/api/functions/:id/vnds` | Привязать ВНД к функции (body: `{ vndId: 5 }`) | Админ |
| `DELETE` | `/api/functions/:funcId/vnds/:vndId` | Отвязать ВНД от функции | Админ |

**GET /api/vnds?functionId=ЖИ-01 — ответ:**
```json
[
  {
    "id": 1,
    "name": "Положение о формировании и реализации жилищной политики Фонда",
    "type": "Положение",
    "number": "№ П-12",
    "date": "2024-02-02",
    "status": "Действующий",
    "url": "https://portal.example.com/knowledge-base/doc/12"
  }
]
```

---

### 3.4. История изменений

| Метод | URL | Описание | Роль |
|---|---|---|---|
| `GET` | `/api/functions/:id/history` | История изменений функции (сортировка: новые первые) | Все |

> История создаётся автоматически на бэкенде при `POST/PUT/PATCH` операциях с функцией. Фронтенд **не отправляет** записи истории — бэкенд сам сравнивает old/new значения.

**GET /api/functions/ЖИ-01/history — ответ:**
```json
[
  {
    "id": 1,
    "functionId": "ЖИ-01",
    "date": "2024-06-20T14:30:00.000Z",
    "user": { "id": 12, "name": "Иванова И.И." },
    "field": "description",
    "oldValue": "Разработка и реализация мероприятий...",
    "newValue": "Разработка и реализация мероприятий... Директор департамента."
  }
]
```

---

### 3.5. Справочники

| Метод | URL | Описание | Роль |
|---|---|---|---|
| `GET` | `/api/departments` | Список подразделений | Все |
| `GET` | `/api/employees` | Список сотрудников | Все |
| `GET` | `/api/employees?departmentId=1` | Сотрудники подразделения | Все |
| `GET` | `/api/auth/me` | Текущий пользователь + роль | Все |

**GET /api/auth/me — ответ:**
```json
{
  "id": 12,
  "name": "Иванова И.И.",
  "role": "admin",
  "departmentId": 4
}
```

---

### 3.6. Экспорт и импорт

| Метод | URL | Описание | Роль |
|---|---|---|---|
| `GET` | `/api/functions/export` | Экспорт каталога в XLSX (принимает те же query-параметры фильтрации, что `GET /api/functions`) | Все |
| `POST` | `/api/functions/import` | Импорт функций из XLSX/CSV (multipart `file`). Ответ: `{ created, updated, skipped, errors[] }` | Админ |

**GET /api/functions/export — ответ:** файл `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` с заголовком `Content-Disposition: attachment; filename="catalog.xlsx"`.

> Экспорт лучше формировать на бэкенде (библиотеки: `openpyxl` для Python, `exceljs` для Node.js), чтобы результат учитывал серверные фильтры и был идентичен для всех пользователей.

**POST /api/functions/import — правила (как на фронте):**

- колонки те же, что в п. 22 ТЗ / файле выгрузки;
- ключ — код функции: insert или update;
- BPMN XML из таблицы не восстанавливается (в Excel только признак наличия);
- ВНД сопоставляются по наименованию с уже существующими документами, новые ВНД не создаются;
- строки с ошибками валидации пропускаются, корректные применяются;
- каждое изменение пишется в `change_history`.

> В ТЗ (п. 22) описан только экспорт. Импорт — согласованное расширение, чтобы администратор мог массово актуализировать реестр тем же файлом.

---

## 4. Авторизация

### Роли

| Роль | Просмотр | Создание | Редактирование | Архивирование | BPMN | ВНД-связи |
|---|---|---|---|---|---|---|
| `user` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Реализация

- Фронтенд определяет роль из `GET /api/auth/me` при загрузке приложения
- Все `POST/PUT/PATCH/DELETE` эндпоинты должны проверять роль на бэкенде
- При `403 Forbidden` фронтенд показывает toast-уведомление

### Рекомендуемая схема

```
Authorization: Bearer <jwt_token>
```

Или, если используется сессия ВКП:
```
Cookie: session_id=...
```

---

## 5. Формат ошибок

Рекомендуемый единый формат:

```json
{
  "error": {
    "code": "FUNCTION_NOT_FOUND",
    "message": "Функция с кодом ЖИ-99 не найдена"
  }
}
```

**HTTP-коды:**

| Код | Когда |
|---|---|
| 200 | Успешный запрос |
| 201 | Успешное создание |
| 400 | Ошибка валидации (невалидный код, пустое имя) |
| 401 | Не авторизован |
| 403 | Нет прав (user пытается редактировать) |
| 404 | Сущность не найдена |
| 409 | Конфликт (дублирующий код функции) |
| 500 | Серверная ошибка |

---

## 6. Интеграция с Базой знаний (п. 11 ТЗ)

ВНД не дублируются в каталоге — хранится только ссылка. Варианты:

1. **По URL** — в таблице `vnds` хранится `url` на документ в Базе знаний. Просто, но ссылки могут ломаться.
2. **По ID документа** — в Базе знаний есть API с постоянным идентификатором документа. Каталог хранит `external_doc_id`, а URL формируется динамически.

Рекомендация: вариант 2, если Базы знаний поддерживает API.

---

## 7. BPMN-схемы

### Хранение

- `bpmn_xml` хранится как TEXT в БД (полный XML BPMN 2.0)
- Альтернатива: хранить файл в S3/MinIO и в БД только ссылку `bpmn_file_id`
- Фронтенд принимает XML строку и передаёт в bpmn-js для рендеринга

### Загрузка

Эндпоинт `PUT /api/functions/:id/bpmn` принимает:
- `Content-Type: application/xml` — сырой XML в body
- или `Content-Type: multipart/form-data` — файл `.bpmn` в поле `file`

### Валидация

Рекомендуется валидировать XML на бэкенде:
- Проверить, что это валидный XML
- Проверить наличие `<bpmn:definitions>` корневого элемента
- Ограничение размера: рекомендуется до 5 МБ

---

## 8. Полнотекстовый поиск (п. 12 ТЗ)

Поиск должен работать по:
- `functions.id` (код)
- `functions.name` (наименование)
- `functions.description` (описание)
- `departments.name` (через JOIN)
- `employees.name` (через JOIN)
- `vnds.name` (через JOIN function_vnds)

### Рекомендации

- **PostgreSQL:** использовать `tsvector` + `tsquery` с русской конфигурацией (`to_tsvector('russian', ...)`)
- **Elasticsearch:** если объём данных вырастет
- Фронтенд отправляет `?search=жилищн` — бэкенд ищет по всем полям

---

## 9. Журналирование (п. 15, 20 ТЗ)

Бэкенд должен автоматически создавать записи в `change_history` при:

| Событие | field_name | old_value | new_value |
|---|---|---|---|
| Создание функции | `(создание)` | — | Функция создана |
| Изменение поля | имя поля (`name`, `status`, ...) | старое значение | новое значение |
| Загрузка BPMN | `bpmnXml` | (отсутствует) | (загружена BPMN-схема) |
| Архивирование | `status` | Действующая | Архивная |
| Привязка ВНД | `vnd` | — | Добавлен: «Название ВНД» |
| Отвязка ВНД | `vnd` | Удалён: «Название ВНД» | — |

---

## 10. Производительность (п. 21 ТЗ)

| Операция | Требование |
|---|---|
| Открытие главной страницы | < 3 сек |
| Открытие карточки функции (без BPMN) | < 3 сек |
| Поиск / фильтрация | < 3 сек |

### Рекомендации

- Индексы на `direction_id`, `parent_id`, `status` (см. DDL выше)
- `bpmn_xml` — lazy loading (не включать в списочные запросы)
- Пагинация на бэке: `LIMIT/OFFSET` или cursor-based
- Кэширование справочников (направления, подразделения, сотрудники) — меняются редко
- `functionsCount` считать через `COUNT(*)` + GROUP BY, а не N+1 запросами

---

## 11. Чек-лист интеграции

Порядок подключения фронтенда к бэкенду:

- [ ] Реализовать `GET /api/auth/me` → заменить `AuthContext` на реальную проверку
- [ ] Реализовать `GET /api/departments` + `GET /api/employees` → заменить `user/model/data.js`
- [ ] Реализовать CRUD для directions → заменить `direction/model/storage.js`
- [ ] Реализовать CRUD для functions (с фильтрацией + пагинацией) → заменить `function-item/model/storage.js`
- [ ] Реализовать `GET/POST/DELETE` для function-VND связей → заменить `vnd/model/storage.js`
- [ ] Реализовать `GET /api/functions/:id/history` → заменить `change-history/model/storage.js`
- [ ] Реализовать `PUT /api/functions/:id/bpmn` и `DELETE /api/functions/:id/bpmn` (UI загрузки на фронте уже есть)
- [ ] Реализовать `PUT /api/functions/reorder` и `PUT /api/directions/reorder` (UI ↑/↓ на фронте уже есть)
- [ ] Реализовать `GET /api/functions/export` → заменить клиентский SpreadsheetML экспорт
- [ ] Реализовать `POST /api/functions/import` → заменить клиентский разбор Excel/CSV
- [ ] Настроить серверную авторизацию (проверка ролей на каждом мутирующем эндпоинте)
- [ ] Настроить автоматическое журналирование изменений на бэке
