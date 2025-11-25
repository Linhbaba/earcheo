import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = window.location.origin;

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || '/map');
  };

  if (!domain || !clientId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 max-w-md">
          <h1 className="text-red-400 font-display text-xl mb-4">Configuration Error</h1>
          <p className="text-white/70 font-mono text-sm">
            Auth0 domain and client ID must be set in .env.local file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

