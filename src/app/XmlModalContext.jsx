import { createContext, useCallback, useContext, useState } from 'react';
import { XmlModal } from '@/widgets/xml-modal';

const XmlModalContext = createContext(null);

export function XmlModalProvider({ children }) {
  const [xml, setXml] = useState(null);

  const openXmlModal = useCallback((xmlStr) => setXml(xmlStr), []);
  const closeXmlModal = useCallback(() => setXml(null), []);

  return (
    <XmlModalContext.Provider value={openXmlModal}>
      {children}
      {xml && <XmlModal xml={xml} onClose={closeXmlModal} />}
    </XmlModalContext.Provider>
  );
}

export function useXmlModal() {
  const ctx = useContext(XmlModalContext);
  if (!ctx) throw new Error('useXmlModal must be used inside XmlModalProvider');
  return ctx;
}
