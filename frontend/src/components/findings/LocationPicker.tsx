import { useState, useEffect, useRef } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre';
import { X, MapPin, Crosshair, Navigation } from 'lucide-react';
import { clsx } from 'clsx';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export const LocationPicker = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLatitude,
  initialLongitude,
}: LocationPickerProps) => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: initialLatitude || 50.0755,
    longitude: initialLongitude || 14.4378,
    zoom: 13,
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialLatitude && initialLongitude
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setViewState({
        latitude: initialLatitude,
        longitude: initialLongitude,
        zoom: 15,
      });
      setSelectedLocation({ latitude: initialLatitude, longitude: initialLongitude });
    }
  }, [initialLatitude, initialLongitude]);

  const handleMapClick = (event: any) => {
    const { lng, lat } = event.lngLat;
    setSelectedLocation({ latitude: lat, longitude: lng });
  };

  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ latitude, longitude });
          setViewState({ latitude, longitude, zoom: 15 });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.latitude, selectedLocation.longitude);
      onClose();
    }
  };

  const handleCenterOnSelected = () => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-surface border border-primary/30 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl text-primary">Vyberte polohu</h2>
            <p className="text-xs text-white/50 font-mono mt-1">
              Klikněte na mapu nebo použijte GPS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            onClick={handleMapClick}
            cursor="crosshair"
          >
            {/* Selected Location Marker */}
            {selectedLocation && (
              <Marker
                longitude={selectedLocation.longitude}
                latitude={selectedLocation.latitude}
                anchor="bottom"
              >
                <div className="relative">
                  <div className="absolute w-12 h-12 bg-primary/30 rounded-full blur-md"
                       style={{ left: '-24px', top: '-24px' }} />
                  <MapPin 
                    className="w-10 h-10 text-primary drop-shadow-lg animate-bounce" 
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                </div>
              </Marker>
            )}
          </Map>

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLoadingLocation}
              className={clsx(
                "p-3 bg-surface/95 backdrop-blur-sm border border-primary/30 rounded-xl hover:bg-surface/80 transition-all shadow-lg",
                isLoadingLocation && "opacity-50 cursor-not-allowed"
              )}
              title="Použít mou polohu"
            >
              <Navigation className={clsx(
                "w-5 h-5 text-primary",
                isLoadingLocation && "animate-spin"
              )} />
            </button>
            
            {selectedLocation && (
              <button
                onClick={handleCenterOnSelected}
                className="p-3 bg-surface/95 backdrop-blur-sm border border-primary/30 rounded-xl hover:bg-surface/80 transition-all shadow-lg"
                title="Zaměřit na vybranou polohu"
              >
                <Crosshair className="w-5 h-5 text-primary" />
              </button>
            )}
          </div>

          {/* Coordinates Display */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 bg-surface/95 backdrop-blur-sm border border-primary/30 rounded-xl px-4 py-3 shadow-lg">
              <p className="text-xs text-white/50 font-mono mb-1">Vybraná poloha:</p>
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                <div>
                  <span className="text-white/40 text-xs">LAT:</span>
                  <span className="text-primary ml-2">{selectedLocation.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-white/40 text-xs">LNG:</span>
                  <span className="text-primary ml-2">{selectedLocation.longitude.toFixed(6)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-mono text-sm transition-colors"
          >
            Zrušit
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={clsx(
              "px-6 py-3 rounded-xl font-mono text-sm transition-all flex items-center gap-2",
              selectedLocation
                ? "bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary"
                : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            <MapPin className="w-4 h-4" />
            Potvrdit polohu
          </button>
        </div>
      </div>
    </div>
  );
};

