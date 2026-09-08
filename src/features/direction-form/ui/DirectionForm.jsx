import { useState } from 'react';
import { Input, Select, Button, Modal } from '@/shared/ui';
import { DIRECTION_ICONS, addDirection, updateDirection } from '@/entities/direction';
import { useToast } from '@/shared/toast';
import styles from './DirectionForm.module.css';

export function DirectionForm({ open, onClose, editItem, onSaved }) {
  const isEdit = !!editItem;
  const [form, setForm] = useState(
    editItem ? { name: editItem.name, icon: editItem.icon } : { name: '', icon: 'building' },
  );
  const { showToast } = useToast();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Укажите наименование направления', 'error');
      return;
    }

    if (isEdit) {
      updateDirection(editItem.id, { name: form.name.trim(), icon: form.icon });
      showToast('Направление обновлено', 'success');
    } else {
      addDirection({ name: form.name.trim(), icon: form.icon });
      showToast('Направление создано', 'success');
    }

    onSaved?.();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редактировать направление' : 'Создать направление'}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input label="Наименование *" id="dir-name" value={form.name} onChange={set('name')} />
        <Select
          label="Иконка"
          id="dir-icon"
          options={DIRECTION_ICONS}
          value={form.icon}
          onChange={set('icon')}
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
