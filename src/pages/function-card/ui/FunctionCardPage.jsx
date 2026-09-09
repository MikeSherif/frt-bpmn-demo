import { useState, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';
import { getFunctionById, getChildFunctions, updateFunction, reorderFunctions } from '@/entities/function-item';
import { getDirectionById } from '@/entities/direction';
import { demoProcessXml } from '@/entities/bpmn-process';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';
import { addHistoryEntry } from '@/entities/change-history';
import { useBpmnViewer } from '@/features/bpmn-viewer/model/useBpmnViewer';
import { FunctionTable } from '@/features/function-table';
import { FunctionForm } from '@/features/function-form';
import { VndPanel } from '@/features/vnd-panel';
import { ChangeHistory } from '@/features/change-history';
import { Breadcrumbs } from '@/widgets/breadcrumbs';
import { Tabs, Badge, Button } from '@/shared/ui';
import { useToast } from '@/shared/toast';
import { readTextFile, isValidBpmnXml, formatImportError } from '@/shared/lib/file';
import { useCatalogTick } from '@/shared/lib/catalogSync';
import styles from './FunctionCardPage.module.css';

function getDeptName(id) {
  return DEPARTMENTS.find((d) => d.id === id)?.name || '—';
}
function getEmpName(id) {
  return EMPLOYEES.find((e) => e.id === id)?.name || '—';
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU');
}

const TABS = [
  { key: 'info', label: 'Общая информация' },
  { key: 'history', label: 'История изменений' },
];

export function FunctionCardPage() {
  const { functionId } = useParams();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  useCatalogTick();
  const [tab, setTab] = useState('info');
  const [showEdit, setShowEdit] = useState(false);
  const [, setRefresh] = useState(0);

  const func = getFunctionById(functionId);
  if (!func) return <Navigate to="/" replace />;

  const direction = getDirectionById(func.directionId);
  const children = getChildFunctions(func.id);
  const parentFunc = func.parentId ? getFunctionById(func.parentId) : null;
  const bump = () => setRefresh((v) => v + 1);

  const bpmnXml = func.bpmnXml === '__DEMO__' ? demoProcessXml : func.bpmnXml;

  const crumbs = [
    { label: 'Каталог функций Фонда', to: '/' },
    direction && { label: direction.name, to: `/direction/${direction.id}` },
    parentFunc && { label: `${parentFunc.id}. ${parentFunc.name}`, to: `/function/${parentFunc.id}` },
    { label: `${func.id}. ${func.name}` },
  ].filter(Boolean);

  const handleArchive = () => {
    updateFunction(func.id, { status: 'Архивная' });
    addHistoryEntry({ functionId: func.id, field: 'status', oldValue: func.status, newValue: 'Архивная' });
    showToast('Функция архивирована', 'success');
    bump();
  };

  const handleBpmnUpload = async (file) => {
    try {
      const xml = await readTextFile(file);
      if (!isValidBpmnXml(xml)) {
        showToast('Файл не является корректным BPMN 2.0 XML', 'error');
        return;
      }
      updateFunction(func.id, { bpmnXml: xml });
      addHistoryEntry({
        functionId: func.id,
        field: 'bpmnXml',
        oldValue: func.bpmnXml ? '(схема загружена)' : '(отсутствует)',
        newValue: '(загружена BPMN-схема)',
      });
      showToast('BPMN-схема загружена', 'success');
      bump();
    } catch (err) {
      showToast(formatImportError(err), 'error');
    }
  };

  const handleBpmnRemove = () => {
    if (!window.confirm('Удалить BPMN-схему этой функции?')) return;
    updateFunction(func.id, { bpmnXml: null });
    addHistoryEntry({
      functionId: func.id,
      field: 'bpmnXml',
      oldValue: '(схема загружена)',
      newValue: '(отсутствует)',
    });
    showToast('BPMN-схема удалена', 'success');
    bump();
  };

  return (
    <div className={styles.page}>
      <Breadcrumbs items={crumbs} />

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{func.id}. {func.name}</h1>
        </div>
        {isAdmin && (
          <div className={styles.adminBtns}>
            <Button onClick={() => setShowEdit(true)}>✏️ Редактировать</Button>
            {func.status !== 'Архивная' && (
              <Button variant="secondary" onClick={handleArchive}>📦 Архивировать</Button>
            )}
          </div>
        )}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'info' && (
        <div className={styles.content}>
          <div className={styles.main}>
            <BpmnSection
              xml={bpmnXml}
              isAdmin={isAdmin}
              onUpload={handleBpmnUpload}
              onRemove={handleBpmnRemove}
            />

            {children.length > 0 && (
              <section className={styles.section}>
                <FunctionTable
                  functions={children}
                  title="Функции 2-го уровня"
                  showDescription={true}
                  sortable={isAdmin && children.length > 1}
                  onReorder={(ids) => { reorderFunctions(ids); bump(); }}
                />
              </section>
            )}
          </div>

          <div className={styles.sidebar}>
            <VndPanel functionId={func.id} isAdmin={isAdmin} onChanged={bump} />

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Общая информация</h3>
              <InfoRow label="Направление" value={direction?.name || '—'} />
              <InfoRow label="Уровень функции" value={`${func.level}-й уровень`} />
              {func.description && <InfoRow label="Описание" value={func.description} />}
              {func.result && <InfoRow label="Результат" value={func.result} />}
              {func.npa && <InfoRow label="НПА регулирующий функцию" value={func.npa} />}
              <InfoRow label="Подразделение" value={getDeptName(func.departmentId)} />
              <InfoRow label="Ответственный" value={getEmpName(func.responsibleId)} />
              <InfoRow label="Статус" value={<Badge>{func.status}</Badge>} />
              <InfoRow label="Последнее изменение" value={formatDate(func.updatedAt)} />
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <ChangeHistory functionId={func.id} />
      )}

      {showEdit && (
        <FunctionForm
          open={showEdit}
          onClose={() => setShowEdit(false)}
          editItem={func}
          onSaved={bump}
        />
      )}
    </div>
  );
}

function BpmnSection({ xml, isAdmin, onUpload, onRemove }) {
  const containerRef = useRef(null);
  const fileRef = useRef(null);
  const { zoom, zoomIn, zoomOut, fit } = useBpmnViewer(containerRef, xml);

  const adminControls = isAdmin && (
    <div className={styles.bpmnAdmin}>
      <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
        {xml ? 'Заменить BPMN' : 'Загрузить BPMN'}
      </Button>
      {xml && (
        <Button type="button" variant="secondary" onClick={onRemove}>Удалить схему</Button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".bpmn,.xml,application/xml,text/xml"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onUpload(file);
        }}
      />
    </div>
  );

  if (!xml) {
    return (
      <section className={styles.bpmnSection}>
        <div className={styles.bpmnHeader}>
          <h3 className={styles.bpmnTitle}>BPMN-схема процесса</h3>
          {adminControls}
        </div>
        <div className={styles.bpmnEmpty}>Бизнес-процесс для данной функции не описан</div>
      </section>
    );
  }

  return (
    <section className={styles.bpmnSection}>
      <div className={styles.bpmnHeader}>
        <h3 className={styles.bpmnTitle}>BPMN-схема процесса</h3>
        <div className={styles.bpmnHeaderRight}>
          <div className={styles.bpmnControls}>
            <button onClick={zoomOut} title="Уменьшить" type="button">−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn} title="Увеличить" type="button">+</button>
            <button onClick={fit} title="По размеру" type="button">⊡</button>
          </div>
          {adminControls}
        </div>
      </div>
      <div className={styles.bpmnCanvas} ref={containerRef} />
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}
