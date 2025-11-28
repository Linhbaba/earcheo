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
import { FeaturesLayout } from './layouts/FeaturesLayout';
import { registerServiceWorker } from './utils/registerServiceWorker';
import './index.css';

// Register Service Worker for offline map caching
if (import.meta.env.PROD) {
  registerServiceWorker();
}

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
              <ProtectedRoute>
                <FeaturesLayout>
                  <FeatureRequests />
                </FeaturesLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        </QueryProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
