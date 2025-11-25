import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, Lightbulb, LogOut, User, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface AuthHeaderProps {
  onLocationSelect?: (lng: number, lat: number, label?: string) => void;
  showSearch?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const AuthHeader = ({ onLocationSelect, showSearch = true }: AuthHeaderProps) => {
  const { user, logout, isAuthenticated } = useAuth0();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; place_name: string; center: [number, number]; }>>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery || searchQuery.length < 3 || !MAPBOX_TOKEN) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?language=cs&limit=5&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      setResults(data.features || []);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (feature: { center: [number, number]; place_name: string }) => {
    setQuery(feature.place_name);
    setShowResults(false);
    setResults([]);
    onLocationSelect?.(feature.center[0], feature.center[1], feature.place_name);
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const navItems = [
    { path: '/map', label: 'Mapa', icon: Map },
    { path: '/features', label: 'Features', icon: Lightbulb },
  ];

  return (
    <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
      <div className="flex items-center gap-4 px-6 py-3 bg-surface/80 backdrop-blur-md border-b border-white/10">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 pointer-events-auto">
          {/* Logo Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border border-primary/30 flex items-center justify-center">
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
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm font-mono tracking-wider">eArcheo</span>
            <span className="text-[9px] text-white/50 font-mono tracking-wider uppercase">Dálkový průzkum krajiny</span>
          </div>
        </Link>

        {/* Navigation */}
        {isAuthenticated && (
          <nav className="flex items-center gap-1 ml-6 pointer-events-auto">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all",
                  location.pathname === item.path
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="flex-1 flex justify-center pointer-events-auto relative">
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-white/50" />
                <input
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => query.length >= 3 && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  placeholder="Vyhledat lokalitu... (Praha, Sluštice, ulice)"
                  className="bg-transparent text-white text-xs placeholder-white/40 w-full focus:outline-none font-mono"
                />
                {loading && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
              </div>

              {showResults && results.length > 0 && (
                <div className="absolute mt-2 w-full max-w-md bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl shadow-black/50 text-xs text-white max-h-60 overflow-auto">
                  {results.map(result => (
                    <button
                      key={result.id}
                      className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors font-mono text-white/70 hover:text-white border-b border-white/5 last:border-0"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(result)}
                    >
                      {result.place_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Menu */}
        {isAuthenticated && user && (
          <div className="relative pointer-events-auto ml-auto">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg transition-colors"
            >
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-white/50" />
              )}
              <span className="text-white/70 font-mono text-xs hidden sm:block max-w-[100px] truncate">
                {user.name || user.email}
              </span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-surface/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white font-mono text-sm truncate">{user.name}</p>
                    <p className="text-white/40 font-mono text-xs truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 font-mono text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Odhlásit se
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Version badge */}
        <div className="text-right pointer-events-auto ml-auto">
          <span className="bg-amber-500/20 px-3 py-1 rounded-lg text-amber-400 border border-amber-500/30 text-[10px] font-mono tracking-wider">
            BETA v1.0
          </span>
        </div>
      </div>
    </div>
  );
};

