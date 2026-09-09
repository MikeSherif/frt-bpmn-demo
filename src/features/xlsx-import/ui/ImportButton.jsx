import { useRef, useState } from 'react';
import { Button, Modal, Badge } from '@/shared/ui';
import { useToast } from '@/shared/toast';
import { readTextFile } from '@/shared/lib/file';
import { parseCatalogFile } from '../model/parseCatalog';
import { buildImportPlan, applyImportPlan } from '../model/applyImport';
import styles from './ImportButton.module.css';

const ACTION_LABEL = {
  create: 'Создание',
  update: 'Обновление',
  error: 'Ошибка',
};

export function ImportButton({ onImported }) {
  const fileRef = useRef(null);
  const { showToast } = useToast();
  const [plan, setPlan] = useState(null);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    try {
      setBusy(true);
      const text = await readTextFile(file);
      const records = parseCatalogFile(text, file.name);
      const nextPlan = buildImportPlan(records);
      setFileName(file.name);
      setPlan(nextPlan);
      if (!nextPlan.rows.length) {
        showToast('В файле нет строк с функциями', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Не удалось прочитать файл', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleApply = () => {
    if (!plan || plan.summary.valid === 0) return;
    try {
      const result = applyImportPlan(plan);
      showToast(`Импорт выполнен: создано ${result.created}, обновлено ${result.updated}`, 'success');
      setPlan(null);
      onImported?.();
    } catch (err) {
      showToast(err.message || 'Не удалось применить импорт', 'error');
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
        📤 Импорт из Excel
      </Button>
      <input
        ref={fileRef}
        className={styles.hiddenInput}
        type="file"
        accept=".xls,.xml,.csv,.txt,application/xml,text/csv,text/xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />

      {plan && (
        <Modal
          open
          wide
          onClose={() => setPlan(null)}
          title={`Предпросмотр импорта${fileName ? `: ${fileName}` : ''}`}
        >
          <p className={styles.hint}>
            Формат совпадает с выгрузкой Каталога (п. 22 ТЗ). Новые коды создают функции,
            существующие — обновляют карточку. BPMN из Excel не загружается: в файле есть
            только признак «Да/Нет». Неизвестные ВНД не создаются, чтобы не дублировать Базу знаний.
            Строки с ошибками будут пропущены.
          </p>

          <div className={styles.summary}>
            <span className={styles.chip}>Всего: {plan.summary.total}</span>
            <span className={`${styles.chip} ${styles.chipCreate}`}>Создать: {plan.summary.create}</span>
            <span className={`${styles.chip} ${styles.chipUpdate}`}>Обновить: {plan.summary.update}</span>
            <span className={`${styles.chip} ${styles.chipError}`}>Ошибки: {plan.summary.error}</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Строка</th>
                  <th>Код</th>
                  <th>Наименование</th>
                  <th>Действие</th>
                  <th>Замечания</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row) => (
                  <tr key={`${row.row}-${row.id}`}>
                    <td>{row.row}</td>
                    <td>{row.id || '—'}</td>
                    <td>{row.name || '—'}</td>
                    <td>
                      <Badge variant={row.action === 'error' ? 'muted' : undefined}>
                        {ACTION_LABEL[row.action]}
                      </Badge>
                    </td>
                    <td>
                      {row.errors.length > 0 && (
                        <ul className={styles.messages}>
                          {row.errors.map((msg) => <li key={msg}>{msg}</li>)}
                        </ul>
                      )}
                      {row.warnings.length > 0 && (
                        <ul className={styles.warnings}>
                          {row.warnings.map((msg) => <li key={msg}>{msg}</li>)}
                        </ul>
                      )}
                      {!row.errors.length && !row.warnings.length && '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <Button type="button" onClick={handleApply} disabled={plan.summary.valid === 0}>
              Импортировать корректные строки ({plan.summary.valid})
            </Button>
            <Button type="button" variant="secondary" onClick={() => setPlan(null)}>Отмена</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
