import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/shared/toast';
import { Header } from '@/widgets/header';
import { XmlModalProvider } from './XmlModalContext';
import { ViewerPage } from '@/pages/viewer';
import { EditorPage } from '@/pages/editor';

export function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <XmlModalProvider>
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<ViewerPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </XmlModalProvider>
      </ToastProvider>
    </HashRouter>
  );
}
