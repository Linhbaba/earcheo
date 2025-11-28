import { useEffect, useState } from 'react';
import type { ViewState } from 'react-map-gl';
import { Package } from 'lucide-react';
import { AuthHeader } from '../components/AuthHeader';
import { CommandDeck } from '../components/CommandDeck';
import { MapBoard } from '../components/MapBoard';
import { MapStyleSelector } from '../components/MapStyleSelector';
import { CompassControl } from '../components/CompassControl';
import { LocationControl, type UserLocation } from '../components/LocationControl';
import { TerrainControls } from '../components/TerrainControls';
import { MobileCommandDeck } from '../components/MobileCommandDeck';
import { MobileMapHeader } from '../components/MobileMapHeader';
import { FindingsModal } from '../components/findings/FindingsModal';
import { FindingDetail } from '../components/findings/FindingDetail';
import { FeatureRequestsModal } from '../components/FeatureRequestsModal';
import { EquipmentModal } from '../components/equipment';
import { ProfileModal } from '../components/profile';
import { useIsMobile } from '../hooks/useIsMobile';
import { useProfile } from '../hooks/useProfile';
import { useFindings } from '../hooks/useFindings';
import type { MapStyleKey } from '../components/SwipeMap';
import type { VisualFilters } from '../types/visualFilters';
import { defaultVisualFilters } from '../types/visualFilters';
import { SEOHead } from '../components/SEOHead';
import type { Finding } from '../types/database';

export const MapPage = () => {
  const isMobile = useIsMobile();
  
  // Initialize user profile (creates profile on first login)
  useProfile();
  
  // Load findings for map markers
  const { findings } = useFindings();
  
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
  const [isFindingsOpen, setIsFindingsOpen] = useState(false);
  const [selectedFindingFromMap, setSelectedFindingFromMap] = useState<Finding | null>(null);
  const [isFeatureRequestsOpen, setIsFeatureRequestsOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAddFindingForm, setShowAddFindingForm] = useState(false);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 15.5,
    latitude: 49.75,
    zoom: 7.5,
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

  // Na mobilu defaultně vypnout split mode, ale nechat uživatele ho zapnout
  useEffect(() => {
    // Pouze při první detekci mobilu, ne při každé změně
    if (isMobile && splitMode === 'vertical') {
      // Výchozí hodnota na mobilu - bez rozdělení, uživatel může změnit
      setSplitMode('none');
    }
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === 'OPTIC') {
      if (splitMode !== 'none') {
        setSplitMode('none');
      }
      setWasSplitForced(true);
    } else if (wasSplitForced && !isMobile) {
      setSplitMode(preferredSplitMode);
      setWasSplitForced(false);
    }
  }, [mode, splitMode, preferredSplitMode, wasSplitForced, isMobile]);

  const splitModeLocked = mode === 'OPTIC';

  // Mobile-specific handlers
  const handleResetNorth = () => {
    setViewState(prev => ({ ...prev, bearing: 0 }));
  };

  return (
    <>
      <SEOHead
        title="Interaktivní mapa"
        description="Interaktivní 3D vizualizace terénu České republiky. Prohlížejte LiDAR data, ortofoto a historické mapy v reálném čase. Nástroje pro terénní analýzu a archeologický průzkum."
        keywords="interaktivní mapa, lidar visualizace, 3d terén, ortofoto mapa, historické mapy, terénní analýza"
        canonicalUrl="/map"
        noindex={true}
      />
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
              findings={findings}
              onFindingClick={setSelectedFindingFromMap}
            />

        {/* MOBILE UI */}
        {isMobile ? (
          <>
            <MobileMapHeader 
              onLocationSelect={handleLocationSelect}
              setViewState={setViewState}
              onLocationChange={setUserLocation}
              bearing={viewState.bearing}
              onOpenFindings={() => setIsFindingsOpen(true)}
              onOpenFeatureRequests={() => setIsFeatureRequestsOpen(true)}
              onOpenEquipment={() => setIsEquipmentOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Mobile - Add Finding Button (Floating) */}
            <div className="fixed top-20 left-3 z-40 safe-area-inset-top">
              <button
                onClick={() => {
                  setShowAddFindingForm(true);
                  setIsFindingsOpen(true);
                }}
                className="w-14 h-14 bg-gradient-to-br from-primary/30 to-primary/20 active:from-primary/40 active:to-primary/30 border-2 border-primary rounded-2xl flex items-center justify-center transition-all shadow-[0_0_25px_rgba(0,243,255,0.4)] active:shadow-[0_0_35px_rgba(0,243,255,0.6)] active:scale-95 touch-manipulation relative overflow-hidden"
                title="Přidat nový nález"
              >
                {/* Animated pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" />
                
                {/* Icon - Truhla/Box pro archeologické nálezy */}
                <div className="relative w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,243,255,0.9)]" />
                </div>
              </button>
            </div>

            <MobileCommandDeck
              activeMode={mode}
              setMode={setMode}
              splitMode={splitMode}
              setSplitMode={handleSplitModeChange}
              isOrtofotoActive={isOrtofotoActive}
              toggleOrtofoto={() => setIsOrtofotoActive(!isOrtofotoActive)}
              ortofotoOpacity={ortofotoOpacity}
              setOrtofotoOpacity={setOrtofotoOpacity}
              filtersEnabled={filtersEnabled}
              toggleFiltersEnabled={() => setFiltersEnabled(!filtersEnabled)}
              filters={visualFilters}
              onFiltersChange={(key, value) => setVisualFilters(prev => ({ ...prev, [key]: value }))}
              onResetFilters={() => setVisualFilters(defaultVisualFilters)}
              mapStyleKey={mapStyleKey}
              setMapStyleKey={setMapStyleKey}
              exaggeration={exaggeration}
              onExaggerationChange={setExaggeration}
              pitch={viewState.pitch || 0}
              onPitchChange={(pitch) => setViewState(prev => ({ ...prev, pitch }))}
              bearing={viewState.bearing || 0}
              onResetNorth={handleResetNorth}
            />
          </>
        ) : (
          /* DESKTOP UI */
          <>
            <AuthHeader 
              onLocationSelect={handleLocationSelect}
              onOpenFindings={() => setIsFindingsOpen(true)}
              onOpenFeatureRequests={() => setIsFeatureRequestsOpen(true)}
              onOpenEquipment={() => setIsEquipmentOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
            
            {/* Left Side - Add Finding Button */}
            <div className="absolute top-24 left-6 z-40 pointer-events-none">
              <button
                onClick={() => {
                  setShowAddFindingForm(true);
                  setIsFindingsOpen(true);
                }}
                className="pointer-events-auto w-14 h-14 bg-gradient-to-br from-primary/30 to-primary/20 hover:from-primary/40 hover:to-primary/30 border-2 border-primary rounded-2xl flex items-center justify-center transition-all shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] group relative overflow-hidden"
                title="Přidat nový nález"
              >
                {/* Animated pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" />
                
                {/* Icon - Truhla/Box pro archeologické nálezy */}
                <div className="relative w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,243,255,0.9)]" />
                </div>
              </button>
            </div>
            
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
          </>
        )}
        
        {/* Findings Modal */}
        <FindingsModal 
          isOpen={isFindingsOpen}
          onClose={() => {
            setIsFindingsOpen(false);
            setShowAddFindingForm(false);
          }}
          initialShowForm={showAddFindingForm}
        />

        {/* Finding Detail from Map */}
        {selectedFindingFromMap && (
          <FindingDetail
            finding={selectedFindingFromMap}
            onClose={() => setSelectedFindingFromMap(null)}
            onEdit={() => {
              // TODO: Otevřít edit form
              setSelectedFindingFromMap(null);
            }}
            onDelete={() => {
              setSelectedFindingFromMap(null);
            }}
          />
        )}

        {/* Feature Requests Modal */}
        <FeatureRequestsModal
          isOpen={isFeatureRequestsOpen}
          onClose={() => setIsFeatureRequestsOpen(false)}
        />

        {/* Equipment Modal */}
        <EquipmentModal
          isOpen={isEquipmentOpen}
          onClose={() => setIsEquipmentOpen(false)}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </>
  );
};
