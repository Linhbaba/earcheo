import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { ChevronRight, User, Coins, Mail, Medal, Target, Gem } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { TopFeatureRequests } from '../components/TopFeatureRequests';
import { Footer } from '../components/Footer';
import { useEffect, useState } from 'react';
import { useStats } from '../hooks/useStats';
import { Navbar } from '../components/Navbar';
import { ArticleCard } from '../components/ArticleCard';
import { articles } from '../data/articles';

export const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();
  const { data: stats } = useStats();


  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/map' }
    });
  };

  const handleSignUp = () => {
    // Otevře Universal Login - uživatel si vybere login/signup sám
    // Zabraňuje chybě "user already exists" když kliknou existující uživatelé
    loginWithRedirect({
      appState: { returnTo: '/map' }
    });
  };

  return (
    <>
      <SEOHead
        title="Pro objevitele"
        description="Evidence sbírek pro numismatiky, filatelisty a detektoráře. Spravujte mince, známky a nálezy s LiDAR mapou České republiky. Zdarma."
        keywords="lidar, dmr5g, čúzk, archeologický průzkum, digitální model reliéfu, ortofoto, mapa česká republika, 3D terén, dálkový průzkum, archeologie, letecká archeologie, historické mapy"
        canonicalUrl="/"
        ogType="website"
      />
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Custom Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img src="/bcg.webp" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

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
      <Navbar variant="transparent" />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-4 sm:px-8 pt-8 sm:pt-12 pb-8">
        <div className="text-center max-w-3xl w-full">
          {/* Main heading */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl text-white mb-6 sm:mb-8 leading-tight px-4">
            Mapa<br />
            <span className="text-white/70">pro všechny</span><br />
            <span className="text-primary">objevitele!</span>
          </h1>

          {/* Live Stats Bar - under H1 */}
          {stats && stats.totalFindings > 0 ? (
            <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              
              {/* Total findings */}
              <div className="flex items-center gap-1.5 pl-1">
                <Gem className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-mono text-xs sm:text-sm font-medium tabular-nums">{stats.totalFindings.toLocaleString('cs-CZ')}</span>
                <span className="text-white/40 font-mono text-[10px] sm:text-xs">nálezů</span>
              </div>

              {/* Coins */}
              {stats.byType?.coins ? (
                <>
                  <span className="text-white/20 mx-1 sm:mx-2">•</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-mono text-xs sm:text-sm font-medium tabular-nums">{stats.byType.coins.toLocaleString('cs-CZ')}</span>
                    <span className="text-white/40 font-mono text-[10px] sm:text-xs hidden sm:inline">mincí</span>
                  </div>
                </>
              ) : null}

              {/* Military */}
              {stats.byType?.military ? (
                <>
                  <span className="text-white/20 mx-1 sm:mx-2">•</span>
                  <div className="flex items-center gap-1.5">
                    <Medal className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-400 font-mono text-xs sm:text-sm font-medium tabular-nums">{stats.byType.military.toLocaleString('cs-CZ')}</span>
                    <span className="text-white/40 font-mono text-[10px] sm:text-xs hidden sm:inline">militárií</span>
                  </div>
                </>
              ) : null}

              {/* Terrain */}
              {stats.byType?.terrain ? (
                <>
                  <span className="text-white/20 mx-1 sm:mx-2">•</span>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-xs sm:text-sm font-medium tabular-nums">{stats.byType.terrain.toLocaleString('cs-CZ')}</span>
                    <span className="text-white/40 font-mono text-[10px] sm:text-xs hidden sm:inline">terénních</span>
                  </div>
                </>
              ) : null}

              {/* Users */}
              <span className="text-white/20 mx-1 sm:mx-2">•</span>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-white/60" />
                <span className="text-white/70 font-mono text-xs sm:text-sm font-medium tabular-nums">{stats.totalUsers.toLocaleString('cs-CZ')}</span>
                <span className="text-white/40 font-mono text-[10px] sm:text-xs hidden sm:inline">hledačů</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/60 font-mono text-[10px] sm:text-xs tracking-wider">NÁLEZY • MAPY • PŘÍBĚHY</span>
            </div>
          )}

          <p className="text-white/50 text-sm sm:text-lg md:text-xl font-mono mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Evidence sbírek pro numismatiky, filatelisty, detektoráře i archeology. 
            Mince, bankovky, známky, militárie – vše přehledně na jednom místě s mapou a LiDARem.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignUp}
              className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl text-background font-display text-lg tracking-wider transition-all hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:scale-105"
            >
              Začít objevovat
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleLogin}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl text-white font-mono transition-all"
            >
              Otevřít mapu
            </button>
          </div>
        </div>

        {/* Collector Types Section */}
        <div className="mt-20 max-w-6xl w-full px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <span className="text-primary font-mono text-xs tracking-wider">KOMUNITA</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl text-white mb-2">
              Pro koho je eArcheo
            </h3>
            <p className="text-white/50 font-mono text-sm sm:text-base">
              Platforma pro všechny vášnivé sběratele a badatele
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CollectorCard 
              icon={<Coins className="w-8 h-8" />}
              title="Numismatici"
              description="Mince a bankovky"
              color="amber"
            />
            <CollectorCard 
              icon={<Mail className="w-8 h-8" />}
              title="Filatelisté"
              description="Poštovní známky"
              color="emerald"
            />
            <CollectorCard 
              icon={<Medal className="w-8 h-8" />}
              title="Militárie"
              description="Vojenské předměty"
              color="red"
            />
            <CollectorCard 
              icon={<Target className="w-8 h-8" />}
              title="Detektoráři"
              description="Hledání artefaktů"
              color="cyan"
            />
          </div>
        </div>



      </main>

      {/* Magazín - Nejnovější články */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
              <span className="text-amber-400 font-mono text-xs tracking-wider">MAGAZÍN</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl text-white mb-2">
              Nejnovější články
            </h3>
            <p className="text-white/50 font-mono text-sm sm:text-base">
              Příběhy z historie, archeologie a numismatiky
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/magazin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-amber-400 font-mono text-sm transition-all"
            >
              Všechny články
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Top Feature Requests */}
      <TopFeatureRequests />

      {/* Footer */}
      <Footer />

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



// Collector type card component
interface CollectorCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'amber' | 'emerald' | 'red' | 'cyan';
}

const colorClasses = {
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500/50',
    iconBg: 'bg-amber-500/20',
    iconBorder: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/20',
    iconBorder: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    hoverBorder: 'hover:border-red-500/50',
    iconBg: 'bg-red-500/20',
    iconBorder: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
  },
  cyan: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    hoverBorder: 'hover:border-primary/50',
    iconBg: 'bg-primary/20',
    iconBorder: 'border-primary/30',
    text: 'text-primary',
    dot: 'bg-primary',
    glow: 'group-hover:shadow-[0_0_30px_rgba(0,243,255,0.2)]',
  },
};

const CollectorCard = ({ icon, title, description, color }: CollectorCardProps) => {
  const classes = colorClasses[color];
  
  return (
    <div className={`group relative p-6 ${classes.bg} backdrop-blur-sm border ${classes.border} ${classes.hoverBorder} rounded-2xl transition-all duration-300 ${classes.glow}`}>
      {/* Decorative corner */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${classes.bg} rounded-bl-[100px] opacity-50`} />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl ${classes.iconBg} border ${classes.iconBorder} flex items-center justify-center ${classes.text} mb-4 transition-all ${classes.glow}`}>
          {icon}
        </div>
        
        {/* Title & Description */}
        <h3 className="font-display text-white text-xl mb-1">{title}</h3>
        <p className={`${classes.text} font-mono text-sm`}>{description}</p>
      </div>
    </div>
  );
};

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

