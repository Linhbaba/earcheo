import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Map, Layers, Radar, ChevronRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Redirect to map if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/map');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/map' }
    });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      appState: { returnTo: '/map' },
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  return (
    <>
      <SEOHead
        title="Dálkový průzkum krajiny České republiky"
        description="Prozkoumejte krajinu České republiky pomocí pokročilých LiDAR dat, digitálních modelů reliéfu DMR5G a leteckých snímků. Interaktivní 3D vizualizace terénu pro archeology, historiky a badatele."
        keywords="lidar, dmr5g, čúzk, archeologický průzkum, digitální model reliéfu, ortofoto, mapa česká republika, 3D terén, dálkový průzkum, archeologie, letecká archeologie, historické mapy"
        canonicalUrl="/"
        ogType="website"
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 243, 255, 0.1) 2px, rgba(0, 243, 255, 0.1) 4px)'
      }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border border-primary/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" className="text-primary/60" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" className="text-primary/80" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-primary"/>
              <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
              <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display text-lg text-white tracking-wider">eArcheo</h1>
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Dálkový průzkum krajiny</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-[10px] font-mono tracking-wider">
            BETA v1.0
          </span>
          <button
            onClick={handleLogin}
            className="px-4 py-2 text-white/70 hover:text-white font-mono text-sm transition-colors"
          >
            Přihlásit se
          </button>
          <button
            onClick={handleSignUp}
            className="px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-primary font-mono text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
          >
            Registrace
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8">
        <div className="text-center max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 font-mono text-xs tracking-wider">LIDAR DATA • DMR5G • ORTOFOTO</span>
          </div>

          {/* Main heading */}
          <h2 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
            Prozkoumejte
            <span className="block text-primary drop-shadow-[0_0_30px_rgba(0,243,255,0.5)]">
              krajinu z výšky
            </span>
          </h2>

          <p className="text-white/50 text-lg md:text-xl font-mono mb-12 max-w-2xl mx-auto leading-relaxed">
            Přístup k detailním LiDAR datům, digitálním modelům reliéfu 
            a leteckým snímkům České republiky.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignUp}
              className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl text-background font-display text-lg tracking-wider transition-all hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:scale-105"
            >
              Začít zdarma
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleLogin}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl text-white font-mono transition-all"
            >
              Mám účet
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          <FeatureCard 
            icon={<Layers className="w-6 h-6" />}
            title="LiDAR Data"
            description="Vysoké rozlišení DMR5G z ČÚZK"
          />
          <FeatureCard 
            icon={<Map className="w-6 h-6" />}
            title="Více vrstev"
            description="Satelitní snímky, ortofoto ČÚZK"
          />
          <FeatureCard 
            icon={<Radar className="w-6 h-6" />}
            title="3D Terén"
            description="Interaktivní vizualizace reliéfu"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <p className="text-white/30 font-mono text-xs">
          © 2025 eArcheo • Data: ČÚZK, Mapbox
        </p>
      </footer>

        {/* CSS Animation */}
        <style>{`
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>
      </div>
    </>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="group p-6 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-primary/30 transition-all hover:bg-surface/60">
    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all">
      {icon}
    </div>
    <h3 className="font-display text-white text-lg mb-2">{title}</h3>
    <p className="text-white/50 font-mono text-sm">{description}</p>
  </div>
);

