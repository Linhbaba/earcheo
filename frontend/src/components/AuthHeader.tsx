import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, Lightbulb, LogOut, User, ChevronDown, Trash2, CheckCircle, XCircle, Package, Grid3X3 } from 'lucide-react';
import { clsx } from 'clsx';

export type MapMode = 'map' | 'planner';

interface AuthHeaderProps {
  onLocationSelect?: (lng: number, lat: number, label?: string) => void;
  showSearch?: boolean;
  onOpenFindings?: () => void;
  onOpenFeatureRequests?: () => void;
  onOpenEquipment?: () => void;
  onOpenProfile?: () => void;
  mode?: MapMode;
  onModeChange?: (mode: MapMode) => void;
}

export const AuthHeader = ({ 
  onLocationSelect, 
  showSearch = true, 
  onOpenFindings, 
  onOpenFeatureRequests, 
  onOpenEquipment, 
  onOpenProfile,
  mode = 'map',
  onModeChange
}: AuthHeaderProps) => {
  const { user, logout, isAuthenticated } = useAuth0();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; place_name: string; center: [number, number]; }>>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const isOnMapPage = location.pathname === '/map';

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    setShowResults(true);
    
    try {
      // Nominatim OSM Geocoding (free, no API key needed)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=cz&limit=5&accept-language=cs`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'eArcheo.cz (Archaeological Research App)'
        }
      });
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      
      // Convert Nominatim format to our format
      setResults(data.map((item: { place_id: number; display_name: string; lon: string; lat: string }) => ({
        id: item.place_id.toString(),
        place_name: item.display_name,
        center: [parseFloat(item.lon), parseFloat(item.lat)]
      })));
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

  const handleDeleteAccount = () => {
    setShowUserMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    // Clear local storage data
    localStorage.clear();
    
    // Show info message
    setShowDeleteConfirm(false);
    setNotificationMessage({
      type: 'success',
      message: 'Pro dokončení smazání účtu nás prosím kontaktujte na ahoj@earcheo.cz'
    });
    
    // Logout after showing message (delayed)
    setTimeout(() => {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }, 3000);
  };

  return (
    <>
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

        {/* Mode Switcher - only on /map page */}
        {isAuthenticated && isOnMapPage && onModeChange && (
          <nav className="flex items-center ml-6 pointer-events-auto">
            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => onModeChange('map')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm transition-all",
                  mode === 'map'
                    ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Map className="w-4 h-4" />
                Mapa
              </button>
              <button
                onClick={() => onModeChange('planner')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm transition-all",
                  mode === 'planner'
                    ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                Plánovač
              </button>
            </div>
          </nav>
        )}
        
        {/* Simple Map link when not on map page */}
        {isAuthenticated && !isOnMapPage && (
          <nav className="flex items-center gap-1 ml-6 pointer-events-auto">
            <Link
              to="/map"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all text-white/50 hover:text-white hover:bg-white/5"
            >
              <Map className="w-4 h-4" />
              Mapa
            </Link>
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

        {/* Spacer when search is hidden */}
        {!showSearch && <div className="flex-1" />}

        {/* Version badge */}
        <div className="text-right pointer-events-auto">
          <span className="bg-primary/20 px-3 py-1 rounded-lg text-primary border border-primary/30 text-[10px] font-mono tracking-wider">
            v1.2
          </span>
        </div>

        {/* User Menu */}
        {isAuthenticated && user && (
          <div className="relative pointer-events-auto">
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
                  className="fixed inset-0 z-[70]" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[71] pointer-events-auto">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white font-mono text-sm truncate">{user.name}</p>
                    <p className="text-white/40 font-mono text-xs truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 font-mono text-sm transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenFindings?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 font-mono text-sm transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Nálezy
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenEquipment?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 font-mono text-sm transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Vybavení
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenFeatureRequests?.();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 font-mono text-sm transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Navrhnout funkci
                    </button>
                  </div>
                  
                  <div className="border-t border-white/10 py-1">
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 font-mono text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Smazat účet
                    </button>
                  </div>
                  
                  <div className="border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 font-mono text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Odhlásit se
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Delete Account Confirmation Modal - Outside of pointer-events-none wrapper */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        />
        <div className="relative bg-surface border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-display text-xl text-white mb-2">Smazat účet?</h2>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                Opravdu chcete trvale smazat svůj účet? Tato akce je <span className="text-red-400">nevratná</span> a všechna vaše data budou ztracena.
              </p>
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            <p className="text-red-400/90 font-mono text-xs">
              ⚠️ Budou smazána: uložené lokace, návrhy funkcí a osobní nastavení
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-mono text-sm transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={confirmDeleteAccount}
              className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 font-mono text-sm transition-all"
            >
              Smazat účet
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Notification Modal */}
    {notificationMessage && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setNotificationMessage(null)}
        />
        <div className={`relative rounded-2xl p-6 w-full max-w-md shadow-2xl ${
          notificationMessage.type === 'success' 
            ? 'bg-surface border border-primary/30' 
            : 'bg-surface border border-red-500/30'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              notificationMessage.type === 'success'
                ? 'bg-primary/20'
                : 'bg-red-500/20'
            }`}>
              {notificationMessage.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-primary" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-white mb-2">
                {notificationMessage.type === 'success' ? 'Úspěch' : 'Chyba'}
              </h3>
              <p className="text-white/70 font-mono text-sm leading-relaxed">
                {notificationMessage.message}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setNotificationMessage(null)}
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-mono text-sm transition-colors"
            >
              OK
            </button>
        </div>
      </div>
    </div>
    )}
    </>
  );
};

