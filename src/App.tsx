import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { RecordMeProvider } from './components/RecordMeContext';
import { LanguageProvider, useI18n } from './i18n';
import { RegistryProvider } from './lib/registry';
import HomePage from './pages/HomePage';

const FamilyTreePage = lazy(() => import('./pages/FamilyTreePage'));
const PersonPage = lazy(() => import('./pages/PersonPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function Loading() {
  const { t } = useI18n();
  return (
    <p className="mx-auto max-w-6xl px-4 py-16 text-center text-muted" role="status">
      {t('loading')}
    </p>
  );
}

const lazyPage = (node: ReactNode) => <Suspense fallback={<Loading />}>{node}</Suspense>;

/** Old links used "?page=family-tree" etc. Send them to the new addresses. */
function LegacyRedirect({ children }: { children: ReactNode }) {
  const { search, pathname } = useLocation();
  const params = new URLSearchParams(search);
  const page = params.get('page');
  if (pathname === '/' && page) {
    const map: Record<string, string> = { 'family-tree': '/family-tree', gallery: '/gallery', about: '/history', contact: '/contact', donate: '/support', home: '/' };
    return <Navigate to={map[page] ?? '/'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <RegistryProvider>
          <RecordMeProvider>
            <LegacyRedirect>
              <Routes>
                <Route path="/admin/*" element={lazyPage(<AdminApp />)} />
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="family-tree" element={lazyPage(<FamilyTreePage />)} />
                  <Route path="person/:id" element={lazyPage(<PersonPage />)} />
                  <Route path="history" element={lazyPage(<HistoryPage />)} />
                  <Route path="gallery" element={lazyPage(<GalleryPage />)} />
                  <Route path="contact" element={lazyPage(<ContactPage />)} />
                  <Route path="support" element={lazyPage(<SupportPage />)} />
                  <Route path="privacy" element={lazyPage(<PrivacyPage />)} />
                  <Route path="*" element={lazyPage(<NotFoundPage />)} />
                </Route>
              </Routes>
            </LegacyRedirect>
          </RecordMeProvider>
        </RegistryProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
