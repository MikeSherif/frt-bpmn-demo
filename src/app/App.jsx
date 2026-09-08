import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/shared/toast';
import { AuthProvider } from './AuthContext';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';
import { CatalogMainPage } from '@/pages/catalog-main';
import { DirectionPage } from '@/pages/direction';
import { FunctionCardPage } from '@/pages/function-card';
import styles from './styles/App.module.css';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Header />
          <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
              <Routes>
                <Route path="/" element={<CatalogMainPage />} />
                <Route path="/direction/:directionId" element={<DirectionPage />} />
                <Route path="/function/:functionId" element={<FunctionCardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
