import { Button } from '@/shared/ui';
import { useToast } from '@/shared/toast';
import { exportToXlsx } from '../model/exportCatalog';

export function ExportButton({ filters = {} }) {
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      exportToXlsx(filters);
      showToast('Экспорт выполнен', 'success');
    } catch (err) {
      showToast(`Ошибка экспорта: ${err.message}`, 'error');
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport}>
      📥 Экспорт в Excel
    </Button>
  );
}
