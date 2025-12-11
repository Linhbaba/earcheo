import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { Auth0ProviderWithNavigate } from './auth/Auth0ProviderWithNavigate';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { QueryProvider } from './providers/QueryProvider';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { FeatureRequests } from './pages/FeatureRequests';
import { FindingsPage } from './pages/FindingsPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { DataDeletionPage } from './pages/DataDeletionPage';
import { MagazinPage } from './pages/MagazinPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FunkcePage } from './pages/FunkcePage';
import { FeaturesLayout } from './layouts/FeaturesLayout';
import { registerServiceWorker } from './utils/registerServiceWorker';
import './index.css';

// Register Service Worker for offline map caching
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Dispatch event for prerendering
const dispatchRenderEvent = () => {
  document.dispatchEvent(new Event('render-event'));
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <QueryProvider>
        <Toaster 
          theme="dark" 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: '#fff',
            },
          }}
        />
        <Analytics />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/data-deletion" element={<DataDeletionPage />} />
          
          {/* Funkce */}
          <Route path="/funkce" element={<FunkcePage />} />
          
          {/* Magazin routes */}
          <Route path="/magazin" element={<MagazinPage />} />
          <Route path="/magazin/:slug" element={<ArticleDetailPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/map" 
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/findings" 
            element={
              <ProtectedRoute>
                <FindingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/features" 
            element={
              <FeaturesLayout>
                <FeatureRequests />
              </FeaturesLayout>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </QueryProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);

// Trigger prerender event after initial render
setTimeout(dispatchRenderEvent, 100);
