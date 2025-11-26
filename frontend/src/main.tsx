import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { Auth0ProviderWithNavigate } from './auth/Auth0ProviderWithNavigate';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { FeatureRequests } from './pages/FeatureRequests';
import { FindingsPage } from './pages/FindingsPage';
import { FeaturesLayout } from './layouts/FeaturesLayout';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
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
        <Routes>
          {/* Public route */}
          <Route path="/" element={<LandingPage />} />
          
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
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
