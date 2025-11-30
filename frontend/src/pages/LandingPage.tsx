import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Map, Layers, ChevronRight, Search, FileText, Calendar, Bookmark, Split } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { TopFeatureRequests } from '../components/TopFeatureRequests';
import { useEffect, useState } from 'react';

export const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();

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
        description="Prozkoumejte krajinu České republiky pomocí pokročilých LiDAR dat a leteckých snímků. Interaktivní 3D vizualizace terénu pro archeology, historiky a badatele."
        keywords="lidar, dmr5g, čúzk, archeologický průzkum, digitální model reliéfu, ortofoto, mapa česká republika, 3D terén, dálkový průzkum, archeologie, letecká archeologie, historické mapy"
        canonicalUrl="/"
        ogType="website"
      />
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated particles */}
        <ParticleField />
        
        {/* Animated topographic map effect */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15]" style={{ animation: 'topoFloat 30s ease-in-out infinite' }}>
          <defs>
            <pattern id="topo-pattern" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
              {/* Concentric circles like contour lines */}
              <circle cx="200" cy="200" r="50" fill="none" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="1" />
              <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(0, 243, 255, 0.12)" strokeWidth="1" />
              <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(0, 243, 255, 0.1)" strokeWidth="1" />
              <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(0, 243, 255, 0.08)" strokeWidth="1" />
              
              {/* Offset circles for variety */}
              <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(0, 243, 255, 0.1)" strokeWidth="1" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(0, 243, 255, 0.08)" strokeWidth="1" />
              
              <circle cx="300" cy="100" r="35" fill="none" stroke="rgba(0, 243, 255, 0.12)" strokeWidth="1" />
              <circle cx="300" cy="100" r="60" fill="none" stroke="rgba(0, 243, 255, 0.09)" strokeWidth="1" />
              
              {/* Small elevation points */}
              <circle cx="50" cy="50" r="2" fill="rgba(0, 243, 255, 0.3)" />
              <circle cx="150" cy="300" r="2" fill="rgba(0, 243, 255, 0.3)" />
              <circle cx="350" cy="250" r="2" fill="rgba(0, 243, 255, 0.3)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-pattern)" />
        </svg>

      {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
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

      {/* Multiple radial glows for depth */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      
      {/* Scanlines overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 243, 255, 0.1) 2px, rgba(0, 243, 255, 0.1) 4px)'
      }} />
      
      {/* Animated scanner effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 243, 255, 0.03) 50%, transparent 100%)',
          height: '200px',
          animation: 'scannerMove 8s ease-in-out infinite',
        }}
      />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border border-primary/30 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" className="text-primary/60" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" className="text-primary/80" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-primary"/>
              <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
              <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" className="text-primary/50" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-lg text-white tracking-wider">eArcheo</h1>
            <p className="text-[9px] sm:text-[10px] text-white/40 font-mono tracking-widest uppercase hidden xs:block">Dálkový průzkum krajiny</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-4">
          <Link
            to="/changelog"
            className="px-2 py-1.5 sm:px-3 sm:py-2 text-white/50 hover:text-white font-mono text-xs transition-colors hidden sm:block"
          >
            Changelog
          </Link>
          <span className="px-2 py-1 sm:px-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-[9px] sm:text-[10px] font-mono tracking-wider">
            BETA v1.3
          </span>
          <button
            onClick={handleLogin}
            className="px-2 py-1.5 sm:px-4 sm:py-2 text-white/70 hover:text-white font-mono text-xs sm:text-sm transition-colors"
          >
            <span className="hidden sm:inline">Přihlásit se</span>
            <span className="sm:hidden">Přihlásit</span>
          </button>
          <button
            onClick={handleSignUp}
            className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-primary font-mono text-xs sm:text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
          >
            Registrace
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-4 sm:px-8 pt-8 sm:pt-12 pb-8">
        <div className="text-center max-w-3xl w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-full mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 font-mono text-[10px] sm:text-xs tracking-wider">LIDAR DATA • ORTOFOTO</span>
          </div>

          {/* Main heading */}
          <h2 className="font-display text-3xl sm:text-5xl md:text-7xl text-white mb-4 sm:mb-6 leading-tight px-4">
            Prozkoumejte
            <span className="block text-primary drop-shadow-[0_0_30px_rgba(0,243,255,0.5)]">
              krajinu z výšky
            </span>
          </h2>

          <p className="text-white/50 text-sm sm:text-lg md:text-xl font-mono mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Přístup k detailním LiDAR datům, digitálním modelům reliéfu 
            a leteckým snímkům České republiky.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignUp}
              className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl text-background font-display text-lg tracking-wider transition-all hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:scale-105"
            >
              Registrace
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

        {/* Main Features */}
        <div className="mt-20 max-w-6xl w-full px-4">
          <div className="text-center mb-12">
            <h3 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Vše pro dálkový průzkum
            </h3>
            <p className="text-white/50 font-mono text-sm sm:text-base max-w-2xl mx-auto">
              Profesionální nástroje pro archeology a badatele
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Row 1 */}
          <FeatureCard 
            icon={<Layers className="w-6 h-6" />}
              title="LiDAR DMR 5G"
              description="Digitální model reliéfu ve vysokém rozlišení 5x5m z ČÚZK"
          />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Archiv 2007-2022"
              description="Historické ortofoto snímky - sledujte změny krajiny"
            />
            <FeatureCard 
              icon={<Split className="w-6 h-6" />}
              title="Porovnání map"
              description="Swipe režim pro srovnání různých vrstev vedle sebe"
            />
            
            {/* Row 2 */}
          <FeatureCard 
            icon={<Map className="w-6 h-6" />}
              title="Katastr & vrstevnice"
              description="Parcely a ZABAGED výškopis jako překryvné vrstvy"
            />
            <FeatureCard 
              icon={<Search className="w-6 h-6" />}
              title="Správa nálezů"
              description="Dokumentujte nálezy s GPS, fotkami a kategoriemi"
          />
          <FeatureCard 
              icon={<Bookmark className="w-6 h-6" />}
              title="Uložené pohledy"
              description="Rychlý přístup k oblíbeným místům a nastavení"
          />
          </div>
        </div>

      </main>

      {/* Top Feature Requests */}
      <TopFeatureRequests />

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link
            to="/changelog"
            className="text-white/50 hover:text-primary font-mono text-xs transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Changelog
          </Link>
          <span className="text-white/20">·</span>
          <a
            href="mailto:ahoj@earcheo.cz"
            className="text-white/50 hover:text-primary font-mono text-xs transition-colors"
          >
            ahoj@earcheo.cz
          </a>
        </div>
        <p className="text-white/30 font-mono text-xs">
          © 2025 eArcheo
        </p>
      </footer>

      {/* CSS Animation */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes topoFloat {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.15;
          }
          50% { 
            transform: translate(-20px, -20px) scale(1.05); 
            opacity: 0.08;
          }
        }
        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 0.6;
          }
        }
        @keyframes scannerMove {
          0% { 
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh);
            opacity: 0;
          }
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
    <p className="text-white/50 font-mono text-sm leading-relaxed">{description}</p>
  </div>
);

// Animated particle field component
const ParticleField = () => {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 5 + Math.random() * 5,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
