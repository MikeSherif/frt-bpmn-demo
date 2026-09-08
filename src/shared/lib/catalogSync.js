import { useEffect, useState } from 'react';

const EVENT = 'catalog:changed';

export function notifyCatalogChanged() {
  window.dispatchEvent(new Event(EVENT));
}

export function useCatalogTick() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((v) => v + 1);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  return tick;
}
