import { useState } from 'react';
import { Input, Textarea, Select, Button, Modal } from '@/shared/ui';
import { getDirections } from '@/entities/direction';
import { STATUSES, getAllFunctions, addFunction, updateFunction } from '@/entities/function-item';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';
import { addHistoryEntry } from '@/entities/change-history';
import { useToast } from '@/shared/toast';
import styles from './FunctionForm.module.css';

const EMPTY = {
  id: '', name: '', description: '', result: '', npa: '',
  level: '1', directionId: '', parentId: '',
  departmentId: '', responsibleId: '',
  status: 'Действующая', bpmnXml: null,
};

export function FunctionForm({ open, onClose, editItem, onSaved }) {
  const isEdit = !!editItem;
  const [form, setForm] = useState(
    editItem
      ? { ...EMPTY, ...editItem, level: String(editItem.level), npa: editItem.npa || '' }
      : { ...EMPTY },
  );
  const { showToast } = useToast();

  const directions = getDirections();
  const allFuncs = getAllFunctions().filter((f) => f.level === 1);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value ?? e.target.checked }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim() || !form.directionId) {
      showToast('Заполните обязательные поля: код, наименование, направление', 'error');
      return;
    }

    const data = {
      ...form,
      level: Number(form.level),
      directionId: Number(form.directionId),
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      responsibleId: form.responsibleId ? Number(form.responsibleId) : null,
      parentId: form.level === '2' && form.parentId ? form.parentId : null,
      npa: (form.npa || '').trim(),
    };

    if (isEdit) {
      const result = updateFunction(editItem.id, data);
      if (result) {
        const { oldItem, newItem } = result;
        Object.keys(data).forEach((key) => {
          if (String(oldItem[key]) !== String(newItem[key]) && key !== 'updatedAt' && key !== 'updatedBy') {
            addHistoryEntry({
              functionId: editItem.id,
              field: key,
              oldValue: String(oldItem[key] ?? ''),
              newValue: String(newItem[key] ?? ''),
            });
          }
        });
        showToast('Функция обновлена', 'success');
      }
    } else {
      addFunction(data);
      addHistoryEntry({ functionId: data.id, field: '(создание)', oldValue: '', newValue: 'Функция создана' });
      showToast('Функция создана', 'success');
    }

    onSaved?.();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редактировать функцию' : 'Создать функцию'} wide>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Input label="Код функции *" id="func-id" value={form.id} onChange={set('id')} disabled={isEdit} />
          <Select
            label="Уровень *"
            id="func-level"
            options={[{ value: '1', label: '1-й уровень' }, { value: '2', label: '2-й уровень' }]}
            value={form.level}
            onChange={set('level')}
            placeholder=""
          />
        </div>

        <Input label="Наименование *" id="func-name" value={form.name} onChange={set('name')} />
        <Textarea label="Описание" id="func-desc" value={form.description} onChange={set('description')} />
        <Textarea label="Результат" id="func-result" value={form.result} onChange={set('result')} />
        <Input
          label="НПА регулирующий функцию"
          id="func-npa"
          value={form.npa}
          onChange={set('npa')}
        />

        <div className={styles.row}>
          <Select
            label="Направление деятельности *"
            id="func-dir"
            options={directions.map((d) => ({ value: d.id, label: d.name }))}
            value={form.directionId}
            onChange={set('directionId')}
          />
          {form.level === '2' && (
            <Select
              label="Родительская функция"
              id="func-parent"
              options={allFuncs.map((f) => ({ value: f.id, label: `${f.id} — ${f.name}` }))}
              value={form.parentId}
              onChange={set('parentId')}
            />
          )}
        </div>

        <div className={styles.row}>
          <Select
            label="Подразделение"
            id="func-dept"
            options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))}
            value={form.departmentId}
            onChange={set('departmentId')}
          />
          <Select
            label="Ответственный"
            id="func-resp"
            options={EMPLOYEES.map((e) => ({ value: e.id, label: e.name }))}
            value={form.responsibleId}
            onChange={set('responsibleId')}
          />
        </div>

        <Select
          label="Статус"
          id="func-status"
          options={STATUSES.map((s) => ({ value: s, label: s }))}
          value={form.status}
          onChange={set('status')}
          placeholder=""
        />

        <div className={styles.actions}>
          <Button type="submit">{isEdit ? 'Сохранить' : 'Создать'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
        </div>
      </form>
    </Modal>
  );
}
