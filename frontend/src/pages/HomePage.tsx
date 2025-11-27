import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { LandingPage } from './LandingPage';

/**
 * HomePage - Smart router component
 * - Přihlášené uživatele přesměruje rovnou na /map
 * - Nepřihlášené uživatele ukáže landing page
 */
export const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  // Během načítání Auth0 stavu zobrazíme loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/70 font-mono text-sm">Načítání...</p>
        </div>
      </div>
    );
  }

  // Pokud je uživatel přihlášený, přesměruj rovnou na mapu
  if (isAuthenticated) {
    return <Navigate to="/map" replace />;
  }

  // Nepřihlášený uživatel vidí landing page
  return <LandingPage />;
};

