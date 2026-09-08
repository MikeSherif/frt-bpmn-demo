import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/shared/ui';
import { getAllFunctions } from '@/entities/function-item';
import { getAllVnds } from '@/entities/vnd';
import { DEPARTMENTS, EMPLOYEES } from '@/entities/user';
import styles from './CatalogSearch.module.css';

function fullSearch(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const allFuncs = getAllFunctions();
  const matched = new Map();

  allFuncs.forEach((f) => {
    if (
      f.id.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q))
    ) {
      matched.set(f.id, f);
    }
  });

  const vnds = getAllVnds().filter((v) => v.name.toLowerCase().includes(q));
  vnds.forEach((v) => {
    v.functionIds.forEach((fid) => {
      if (!matched.has(fid)) {
        const fn = allFuncs.find((f) => f.id === fid);
        if (fn) matched.set(fn.id, fn);
      }
    });
  });

  const deptIds = DEPARTMENTS.filter((d) => d.name.toLowerCase().includes(q)).map((d) => d.id);
  const empIds = EMPLOYEES.filter((e) => e.name.toLowerCase().includes(q)).map((e) => e.id);

  allFuncs.forEach((f) => {
    if (!matched.has(f.id)) {
      if (deptIds.includes(f.departmentId) || empIds.includes(f.responsibleId)) {
        matched.set(f.id, f);
      }
    }
  });

  return [...matched.values()].slice(0, 10);
}

export function CatalogSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleChange = useCallback((value) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      setResults(fullSearch(value));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, []);

  const handleSelect = useCallback(
    (func) => {
      setShowResults(false);
      setQuery('');
      navigate(`/function/${func.id}`);
    },
    [navigate],
  );

  return (
    <div className={styles.wrap} onBlur={() => setTimeout(() => setShowResults(false), 150)}>
      <SearchInput
        value={query}
        onChange={handleChange}
        onFocus={() => query.trim().length >= 2 && setShowResults(true)}
        placeholder="Поиск по коду, наименованию функции, описанию, подразделению, ВНД..."
        onClear={() => { setQuery(''); setResults([]); setShowResults(false); }}
      />
      {showResults && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((f) => (
            <button key={f.id} className={styles.item} onMouseDown={() => handleSelect(f)} type="button">
              <span className={styles.code}>{f.id}</span>
              <span className={styles.name}>{f.name}</span>
            </button>
          ))}
        </div>
      )}
      {showResults && results.length === 0 && query.trim().length >= 2 && (
        <div className={styles.dropdown}>
          <div className={styles.empty}>Ничего не найдено</div>
        </div>
      )}
    </div>
  );
}
