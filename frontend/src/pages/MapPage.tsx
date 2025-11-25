import { useEffect, useState } from 'react';
import type { ViewState } from 'react-map-gl';
import { AuthHeader } from '../components/AuthHeader';
import { CommandDeck } from '../components/CommandDeck';
import { MapBoard } from '../components/MapBoard';
import { MapStyleSelector } from '../components/MapStyleSelector';
import { CompassControl } from '../components/CompassControl';
import { LocationControl, type UserLocation } from '../components/LocationControl';
import { TerrainControls } from '../components/TerrainControls';
import type { MapStyleKey } from '../components/SwipeMap';
import type { VisualFilters } from '../types/visualFilters';
import { defaultVisualFilters } from '../types/visualFilters';

export const MapPage = () => {
  const [mode, setMode] = useState<'LIDAR' | 'OPTIC'>('LIDAR');
  const [splitMode, setSplitMode] = useState<'vertical' | 'horizontal' | 'none'>('vertical');
  const [preferredSplitMode, setPreferredSplitMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [wasSplitForced, setWasSplitForced] = useState(false);
  const [exaggeration, setExaggeration] = useState(1.5);
  const [isHistoryActive, setIsHistoryActive] = useState(false);
  const [historyOpacity, setHistoryOpacity] = useState(0.7);
  const [isOrtofotoActive, setIsOrtofotoActive] = useState(false);
  const [ortofotoOpacity, setOrtofotoOpacity] = useState(0.8);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visualFilters, setVisualFilters] = useState<VisualFilters>(defaultVisualFilters);
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const [mapStyleKey, setMapStyleKey] = useState<MapStyleKey>('SATELLITE');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 14.665,
    latitude: 50.035,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const handleLocationSelect = (lng: number, lat: number) => {
    setViewState(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: 14
    }));
  };

  const handleSplitModeChange = (mode: 'vertical' | 'horizontal' | 'none') => {
    if (mode === 'none') {
      setSplitMode('none');
    } else {
      setPreferredSplitMode(mode);
      setSplitMode(mode);
    }
  };

  useEffect(() => {
    if (mode === 'OPTIC') {
      if (splitMode !== 'none') {
        setSplitMode('none');
      }
      setWasSplitForced(true);
    } else if (wasSplitForced) {
      setSplitMode(preferredSplitMode);
      setWasSplitForced(false);
    }
  }, [mode, splitMode, preferredSplitMode, wasSplitForced]);

  const splitModeLocked = mode === 'OPTIC';

  return (
    <div className="relative w-screen h-screen bg-background overflow-hidden text-white selection:bg-primary/30">
      
      <MapBoard 
        mode={mode} 
        viewState={viewState}
        setViewState={setViewState}
        splitMode={splitMode}
        exaggeration={exaggeration}
        isHistoryActive={isHistoryActive}
        historyOpacity={historyOpacity}
        isOrtofotoActive={isOrtofotoActive}
        ortofotoOpacity={ortofotoOpacity}
        mapStyleKey={mapStyleKey}
        visualFilters={visualFilters}
        filtersEnabled={filtersEnabled}
        userLocation={userLocation}
      />

      {/* UI Overlays */}
      <AuthHeader onLocationSelect={handleLocationSelect} />
      
      {/* Right Side Control Panel */}
      <div className="absolute top-24 right-6 z-40 flex flex-col items-end gap-4 pointer-events-none">
        <MapStyleSelector activeKey={mapStyleKey} onSelect={setMapStyleKey} />
        
        <CompassControl 
          viewState={viewState} 
          setViewState={setViewState} 
        />

        <LocationControl 
          setViewState={setViewState}
          onLocationChange={setUserLocation}
        />

        {mode === 'LIDAR' && (
          <TerrainControls
            exaggeration={exaggeration}
            onExaggerationChange={setExaggeration}
            pitch={viewState.pitch || 0}
            onPitchChange={(pitch) => setViewState(prev => ({ ...prev, pitch }))}
          />
        )}
      </div>

      <CommandDeck 
        activeMode={mode}
        setMode={setMode}
        splitMode={splitMode}
        setSplitMode={handleSplitModeChange}
        splitModeLocked={splitModeLocked}
        isHistoryActive={isHistoryActive}
        toggleHistory={() => setIsHistoryActive(!isHistoryActive)}
        historyOpacity={historyOpacity}
        setHistoryOpacity={setHistoryOpacity}
        isOrtofotoActive={isOrtofotoActive}
        toggleOrtofoto={() => setIsOrtofotoActive(!isOrtofotoActive)}
        ortofotoOpacity={ortofotoOpacity}
        setOrtofotoOpacity={setOrtofotoOpacity}
        filtersOpen={filtersOpen}
        toggleFilters={() => setFiltersOpen(!filtersOpen)}
        filters={visualFilters}
        onFiltersChange={(key, value) => setVisualFilters(prev => ({ ...prev, [key]: value }))}
        filtersEnabled={filtersEnabled}
        toggleFiltersEnabled={() => setFiltersEnabled(!filtersEnabled)}
        onResetFilters={() => setVisualFilters(defaultVisualFilters)}
      />
      
      {/* Corner Decorations */}
      <div className="absolute top-20 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 pointer-events-none" />
      <div className="absolute top-20 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-20 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-20 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20 pointer-events-none" />
    </div>
  );
};

