import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Menu, X, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

export const Navbar = ({ variant = 'default' }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const location = useLocation();

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/map' }
    });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      appState: { returnTo: '/map' }
    });
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isTransparent = variant === 'transparent';

  return (
    <nav className={`relative z-50 ${isTransparent ? '' : 'sticky top-0 backdrop-blur-md bg-background/80 border-b border-white/10'}`}>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-background focus:rounded-lg"
      >
        Přejít na obsah
      </a>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:border-primary/50 transition-colors">
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
              <span className="font-display text-base sm:text-lg text-white tracking-wider">eArcheo</span>
              <p className="text-[9px] sm:text-[10px] text-white/40 tracking-widest uppercase hidden sm:block">
                Dálkový průzkum krajiny
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            <Link
              to="/funkce"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/funkce') ? 'text-primary bg-primary/10' : 'text-white/50 hover:text-white'}`}
            >
              <Layers className="w-4 h-4" />
              Funkce
            </Link>
            <Link
              to="/magazin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive('/magazin') ? 'text-primary bg-primary/10' : 'text-white/50 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" />
              Magazín
            </Link>
            
            {isAuthenticated ? (
              <Link
                to="/map"
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-primary text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
              >
                Otevřít mapu
              </Link>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  Přihlásit se
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-primary text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                >
                  Registrace
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={isOpen ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/funkce"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/funkce') ? 'text-primary bg-primary/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Layers className="w-4 h-4" />
              Funkce
            </Link>
            <Link
              to="/magazin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/magazin') ? 'text-primary bg-primary/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <BookOpen className="w-4 h-4" />
              Magazín
            </Link>
            
            <div className="pt-4 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <Link
                  to="/map"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary text-sm text-center transition-all"
                >
                  Otevřít mapu
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => { handleLogin(); setIsOpen(false); }}
                    className="block w-full px-4 py-3 text-white/70 hover:text-white text-sm text-center transition-colors"
                  >
                    Přihlásit se
                  </button>
                  <button
                    onClick={() => { handleSignUp(); setIsOpen(false); }}
                    className="block w-full px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-primary text-sm text-center transition-all"
                  >
                    Registrace
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
