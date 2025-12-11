import { Link } from 'react-router-dom';
import { Home, BookOpen, Map, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const NotFoundPage = () => {
  return (
    <>
      <SEOHead
        title="Stránka nenalezena"
        description="Požadovaná stránka nebyla nalezena."
        canonicalUrl="/404"
      />

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            {/* 404 Visual */}
            <div className="relative mb-8">
              <div className="text-[120px] sm:text-[160px] font-display text-white/5 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-12 h-12">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" className="text-primary/40" strokeWidth="1.5" strokeDasharray="4 4"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-primary/60"/>
                    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" className="text-primary/30" strokeWidth="1.5"/>
                    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" className="text-primary/30" strokeWidth="1.5"/>
                    <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" className="text-primary/30" strokeWidth="1.5"/>
                    <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" className="text-primary/30" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Text */}
            <h1 className="font-display text-2xl sm:text-3xl text-white mb-3">
              Stránka nenalezena
            </h1>
            <p className="text-white/50 font-mono text-sm mb-8">
              Tato stránka neexistuje nebo byla přesunuta. 
              Zkuste se vrátit na hlavní stránku nebo prozkoumejte náš magazín.
            </p>

            {/* Navigation Options */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-xl text-primary font-mono text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
              >
                <Home className="w-4 h-4" />
                Hlavní stránka
              </Link>
              
              <Link
                to="/magazin"
                className="flex items-center gap-2 px-6 py-3 bg-surface/60 hover:bg-surface border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white font-mono text-sm transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Magazín
              </Link>
              
              <Link
                to="/map"
                className="flex items-center gap-2 px-6 py-3 bg-surface/60 hover:bg-surface border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white font-mono text-sm transition-all"
              >
                <Map className="w-4 h-4" />
                Mapa
              </Link>
            </div>

            {/* Back Button */}
            <button
              onClick={() => window.history.back()}
              className="mt-8 inline-flex items-center gap-2 text-white/40 hover:text-white/60 font-mono text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zpět na předchozí stránku
            </button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};
