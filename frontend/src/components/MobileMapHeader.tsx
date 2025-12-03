import { useState } from 'react';
import { Search, X, Navigation, Crosshair, User, LogOut, Lightbulb, Package, Map, Grid3X3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { clsx } from 'clsx';
import type { ViewState } from 'react-map-gl/maplibre';
import type { UserLocation } from './LocationControl';
import type { MapMode } from './AuthHeader';

interface MobileMapHeaderProps {
  onLocationSelect: (lng: number, lat: number) => void;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  onLocationChange: (location: UserLocation | null) => void;
  bearing?: number;
  onOpenFindings?: () => void;
  onOpenFeatureRequests?: () => void;
  onOpenEquipment?: () => void;
  onOpenProfile?: () => void;
  mode?: MapMode;
  onModeChange?: (mode: MapMode) => void;
}

export const MobileMapHeader = ({ 
  onLocationSelect, 
  setViewState, 
  onLocationChange,
  bearing = 0,
  onOpenFindings,
  onOpenFeatureRequests,
  onOpenEquipment,
  onOpenProfile,
  mode = 'map',
  onModeChange
}: MobileMapHeaderProps) => {
  const { user, logout, isAuthenticated } = useAuth0();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; place_name: string; center: [number, number]; }>>([]);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    
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
    setResults([]);
    setIsSearchOpen(false);
    onLocationSelect(feature.center[0], feature.center[1]);
  };

  const handleGetLocation = () => {
    console.log('[GPS] Button clicked');
    
    if (!navigator.geolocation) {
      console.error('[GPS] Geolocation is not supported');
      alert('Geolokace není podporována v tomto prohlížeči');
      return;
    }

    console.log('[GPS] Requesting position...');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[GPS] Position received:', position.coords);
        const { longitude, latitude } = position.coords;
        setViewState(prev => ({
          ...prev,
          longitude,
          latitude,
          zoom: 16
        }));
        onLocationChange({ lng: longitude, lat: latitude });
        setIsLocating(false);
      },
      (error) => {
        console.error('[GPS] Error:', error);
        let errorMsg = 'Nepodařilo se získat polohu';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Přístup k poloze byl zamítnut. Povolte přístup v nastavení prohlížeče.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Informace o poloze nejsou k dispozici.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Požadavek na polohu vypršel. Zkuste to znovu.';
            break;
        }
        
        alert(errorMsg);
        setIsLocating(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  return (
    <>
      {/* Compact Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-auto safe-area-inset-top">
        <div className="flex items-center justify-between px-3 py-2 bg-surface/90 backdrop-blur-xl border-b border-white/10">
          {/* Logo + Mode Switcher */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border border-primary/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" className="text-primary/60" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" className="text-primary/80" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-primary"/>
                </svg>
              </div>
            </Link>
            
            {/* Mode Switcher */}
            {onModeChange && (
              <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                <button
                  onClick={() => onModeChange('map')}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-mono text-[10px] transition-all",
                    mode === 'map'
                      ? "bg-primary/20 text-primary"
                      : "text-white/50"
                  )}
                >
                  <Map className="w-3 h-3" />
                  Mapa
                </button>
                <button
                  onClick={() => onModeChange('planner')}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-mono text-[10px] transition-all",
                    mode === 'planner'
                      ? "bg-primary/20 text-primary"
                      : "text-white/50"
                  )}
                >
                  <Grid3X3 className="w-3 h-3" />
                  Plánovač
                </button>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* GPS Button */}
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className={clsx(
                'p-2.5 rounded-xl transition-all relative z-10 touch-manipulation',
                isLocating
                  ? 'bg-primary/20 text-primary animate-pulse cursor-wait'
                  : 'bg-white/10 text-white/60 active:bg-primary/30 active:text-primary active:scale-95'
              )}
              aria-label="Získat aktuální polohu"
            >
              {isLocating ? (
                <>
                  <Navigation className="w-5 h-5 animate-spin" />
                  <span className="sr-only">Načítání polohy...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-5 h-5" />
                  <span className="sr-only">GPS</span>
                </>
              )}
            </button>

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={clsx(
                'p-2.5 rounded-xl transition-all relative z-10',
                isSearchOpen
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/10 text-white/60 active:bg-white/20'
              )}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {isAuthenticated && (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={clsx(
                  'p-1 rounded-xl transition-all relative z-10',
                  isUserMenuOpen
                    ? 'bg-primary/20'
                    : 'bg-white/10 active:bg-white/20'
                )}
              >
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'} 
                    className="w-8 h-8 rounded-lg"
                  />
                ) : (
                  <User className="w-5 h-5 text-white/60" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Panel */}
        {isSearchOpen && (
          <div className="bg-surface/95 backdrop-blur-xl border-b border-white/10 p-3 animate-fade-in">
            <div className="relative">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Vyhledat lokalitu..."
                  className="bg-transparent text-white text-sm placeholder-white/40 w-full focus:outline-none font-mono"
                />
                {loading && (
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                )}
                {query && !loading && (
                  <button
                    onClick={() => { setQuery(''); setResults([]); }}
                    className="p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="w-3 h-3 text-white/50" />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {results.map(result => (
                    <button
                      key={result.id}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 active:bg-white/20 transition-colors font-mono text-sm text-white/80 border-b border-white/5 last:border-0"
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
      </div>

      {/* User Menu Dropdown */}
      {isUserMenuOpen && isAuthenticated && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsUserMenuOpen(false)}
          />
          <div className="fixed top-14 right-3 z-50 w-56 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in safe-area-inset-top">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-10 h-10 rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-mono text-sm truncate">{user?.name}</p>
                <p className="text-white/40 font-mono text-[10px] truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenProfile?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 active:bg-white/10 font-mono text-sm transition-colors"
              >
                <User className="w-5 h-5" />
                Profil
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenFindings?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 active:bg-white/10 font-mono text-sm transition-colors"
              >
                <Search className="w-5 h-5" />
                Nálezy
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenEquipment?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 active:bg-white/10 font-mono text-sm transition-colors"
              >
                <Package className="w-5 h-5" />
                Vybavení
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenFeatureRequests?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 active:bg-white/10 font-mono text-sm transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
                Navrhnout funkci
              </button>
            </div>
            
            {/* Logout Button */}
            <div className="border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 active:bg-red-500/20 font-mono text-sm transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Odhlásit se
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Compass - Only show when rotated */}
      {bearing !== 0 && (
        <button
          onClick={() => setViewState(prev => ({ ...prev, bearing: 0 }))}
          className="fixed top-20 right-3 z-40 w-10 h-10 bg-surface/90 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-lg"
        >
          <Navigation 
            className="w-5 h-5 text-primary transition-transform"
            style={{ transform: `rotate(${-bearing}deg)` }}
          />
        </button>
      )}

      {/* Overlay when search is open */}
      {isSearchOpen && results.length > 0 && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => { setIsSearchOpen(false); setResults([]); }}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top, 0);
        }
      `}</style>
    </>
  );
};

