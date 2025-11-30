import { useState, useEffect } from 'react';
import { MapPin, Navigation, XCircle, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { ViewState } from 'react-map-gl/maplibre';

export interface UserLocation {
  lng: number;
  lat: number;
}

interface LocationControlProps {
  setViewState: (vs: ViewState | ((prev: ViewState) => ViewState)) => void;
  onLocationChange?: (location: UserLocation | null) => void;
  autoStart?: boolean;
  hideUI?: boolean;
}

export const LocationControl = ({ setViewState, onLocationChange, autoStart = false, hideUI = false }: LocationControlProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Notify parent component when location changes
  useEffect(() => {
    onLocationChange?.(userLocation);
  }, [userLocation, onLocationChange]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolokace není v tomto prohlížeči podporována');
      return;
    }

    setError(null);
    setIsTracking(true);

    // Získat aktuální polohu a vycentrovat mapu
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lng: longitude, lat: latitude });
        
        // Vycentrovat mapu na polohu uživatele
        setViewState(prev => ({
          ...prev,
          longitude,
          latitude,
          zoom: Math.max(prev.zoom || 14, 14) // Minimálně zoom 14
        }));
      },
      (err) => {
        setError('Nelze získat polohu: ' + err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Sledovat změny polohy
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lng: longitude, lat: latitude });
      },
      (err) => {
        console.error('Chyba sledování polohy:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setUserLocation(null);
    setError(null);
    onLocationChange?.(null);
  };

  const centerOnLocation = () => {
    if (userLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        zoom: Math.max(prev.zoom || 14, 14)
      }));
    }
  };

  // Auto-start tracking when component mounts with autoStart=true
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
    return () => {
      // Cleanup when autoStart changes to false or unmount
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup při unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Hidden mode - no UI, just tracking
  if (hideUI) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-48 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 flex flex-col gap-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer w-full"
      >
        <div className="flex items-center gap-2">
          <span>GPS</span>
          {isTracking && (
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
          )}
        </div>
        <ChevronDown className={clsx(
          "w-3.5 h-3.5 text-primary transition-transform",
          isExpanded ? "" : "-rotate-90"
        )} />
      </button>

      {isExpanded && (
      <div className="flex flex-col gap-1.5 bg-black/40 p-1 rounded-xl">
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary font-mono text-xs hover:bg-primary/30 transition-all"
            title="Aktivovat GPS polohu"
          >
            <MapPin className="w-4 h-4" />
            <span>Zapnout</span>
          </button>
        ) : (
          <>
            <button
              onClick={centerOnLocation}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 font-mono text-xs transition-all"
              title="Vycentrovat na moji polohu"
            >
              <Navigation className="w-4 h-4" />
              <span>Vycentrovat</span>
            </button>
            <button
              onClick={stopTracking}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 font-mono text-xs transition-all"
              title="Deaktivovat GPS polohu"
            >
              <XCircle className="w-4 h-4" />
              <span>Vypnout</span>
            </button>
          </>
        )}

        {/* Chybová zpráva */}
        {error && (
          <div className="bg-red-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg p-2 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

