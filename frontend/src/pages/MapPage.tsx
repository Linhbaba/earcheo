import { useEffect, useState } from 'react';
import type { ViewState } from 'react-map-gl';
import { Plus, Package } from 'lucide-react';
import { AuthHeader } from '../components/AuthHeader';
import { CommandDeck } from '../components/CommandDeck';
import { MapBoard } from '../components/MapBoard';
import { CompassControl } from '../components/CompassControl';
import { LocationControl, type UserLocation } from '../components/LocationControl';
import { TerrainControls } from '../components/TerrainControls';
import { MobileMapHeader } from '../components/MobileMapHeader';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { FindingsModal } from '../components/findings/FindingsModal';
import { FindingDetail } from '../components/findings/FindingDetail';
import { FeatureRequestsModal } from '../components/FeatureRequestsModal';
import { EquipmentModal } from '../components/equipment';
import { ProfileModal } from '../components/profile';
import { useIsMobile } from '../hooks/useIsMobile';
import { useProfile } from '../hooks/useProfile';
import { useFindings } from '../hooks/useFindings';
import type { VisualFilters } from '../types/visualFilters';
import { defaultVisualFilters } from '../types/visualFilters';
import { SEOHead } from '../components/SEOHead';
import type { Finding, MapSetupConfig } from '../types/database';
import type { MapSideConfig } from '../types/mapSource';
import { DEFAULT_LEFT_CONFIG, DEFAULT_RIGHT_CONFIG } from '../types/mapSource';

export const MapPage = () => {
  const isMobile = useIsMobile();
  
  // Initialize user profile (creates profile on first login)
  useProfile();
  
  // Load findings for map markers
  const { findings } = useFindings();
  
  // Nový L/R systém výběru map
  const [leftMapConfig, setLeftMapConfig] = useState<MapSideConfig>(DEFAULT_LEFT_CONFIG);
  const [rightMapConfig, setRightMapConfig] = useState<MapSideConfig>(DEFAULT_RIGHT_CONFIG);
  const [activeFilterSide, setActiveFilterSide] = useState<'left' | 'right'>('left');
  
  const [splitMode, setSplitMode] = useState<'vertical' | 'horizontal' | 'none'>('vertical');
  const [exaggeration, setExaggeration] = useState(1.5);
  
  // Overlay vrstvy (aplikují se na obě strany)
  const [isKatastrActive, setIsKatastrActive] = useState(false);
  const [katastrOpacity, setKatastrOpacity] = useState(0.6);
  const [isVrstevniceActive, setIsVrstevniceActive] = useState(false);
  const [vrstevniceOpacity, setVrstevniceOpacity] = useState(0.7);
  
  // Filtry (aplikují se na activeFilterSide)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visualFilters, setVisualFilters] = useState<VisualFilters>(defaultVisualFilters);
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isGpsActive, setIsGpsActive] = useState(true); // GPS zapnuto defaultně
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
      setSplitMode(mode);
  };

  // Na mobilu defaultně vypnout split mode
  useEffect(() => {
    if (isMobile && splitMode === 'vertical') {
      setSplitMode('none');
    }
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Načtení uloženého setupu
  const handleLoadSetup = (config: MapSetupConfig) => {
    setLeftMapConfig(config.leftMapConfig as MapSideConfig);
    setRightMapConfig(config.rightMapConfig as MapSideConfig);
    setSplitMode(config.splitMode);
    setExaggeration(config.exaggeration);
    setIsKatastrActive(config.isKatastrActive);
    setKatastrOpacity(config.katastrOpacity);
    setIsVrstevniceActive(config.isVrstevniceActive);
    setVrstevniceOpacity(config.vrstevniceOpacity);
    setVisualFilters(config.visualFilters);
    setFiltersEnabled(config.filtersEnabled);
    if (config.viewState) {
      setViewState(prev => ({ ...prev, ...config.viewState }));
    }
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
              leftMapConfig={leftMapConfig}
              rightMapConfig={rightMapConfig}
              activeFilterSide={activeFilterSide}
              viewState={viewState}
              setViewState={setViewState}
              splitMode={splitMode}
              exaggeration={exaggeration}
              isKatastrActive={isKatastrActive}
              katastrOpacity={katastrOpacity}
              isVrstevniceActive={isVrstevniceActive}
              vrstevniceOpacity={vrstevniceOpacity}
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

            {/* Mobile FAB - Add Finding */}
            <button
              onClick={() => {
                setShowAddFindingForm(true);
                setIsFindingsOpen(true);
              }}
              className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <Plus className="w-7 h-7 text-background" />
            </button>

            {/* Mobile Bottom Bar */}
            <MobileBottomBar
              leftMapConfig={leftMapConfig}
              rightMapConfig={rightMapConfig}
              onLeftMapConfigChange={setLeftMapConfig}
              onRightMapConfigChange={setRightMapConfig}
              splitMode={splitMode}
              setSplitMode={handleSplitModeChange}
              isKatastrActive={isKatastrActive}
              toggleKatastr={() => setIsKatastrActive(!isKatastrActive)}
              katastrOpacity={katastrOpacity}
              setKatastrOpacity={setKatastrOpacity}
              isVrstevniceActive={isVrstevniceActive}
              toggleVrstevnice={() => setIsVrstevniceActive(!isVrstevniceActive)}
              vrstevniceOpacity={vrstevniceOpacity}
              setVrstevniceOpacity={setVrstevniceOpacity}
              filters={visualFilters}
              onFiltersChange={(key, value) => setVisualFilters(prev => ({ ...prev, [key]: value }))}
              filtersEnabled={filtersEnabled}
              toggleFiltersEnabled={() => setFiltersEnabled(!filtersEnabled)}
              onResetFilters={() => setVisualFilters(defaultVisualFilters)}
              isGpsActive={isGpsActive}
              toggleGps={() => setIsGpsActive(!isGpsActive)}
              onCenterGps={() => {
                if (userLocation) {
                  setViewState(prev => ({ ...prev, longitude: userLocation.lng, latitude: userLocation.lat, zoom: 16 }));
                }
              }}
              exaggeration={exaggeration}
              onLoadSetup={handleLoadSetup}
              onOpenFindings={() => setIsFindingsOpen(true)}
              onOpenEquipment={() => setIsEquipmentOpen(true)}
              onOpenFeatureRequests={() => setIsFeatureRequestsOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* GPS tracking for mobile */}
            {isGpsActive && (
              <LocationControl 
                setViewState={setViewState}
                onLocationChange={setUserLocation}
                autoStart
                hideUI
              />
            )}
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
              <CompassControl 
                viewState={viewState} 
                setViewState={setViewState} 
              />

              <TerrainControls
                exaggeration={exaggeration}
                onExaggerationChange={setExaggeration}
                pitch={viewState.pitch || 0}
                onPitchChange={(pitch) => setViewState(prev => ({ ...prev, pitch }))}
              />
            </div>

            {/* GPS Location tracking - hidden, controlled from CommandDeck */}
            {isGpsActive && (
              <LocationControl 
                setViewState={setViewState}
                onLocationChange={setUserLocation}
                autoStart
                hideUI
              />
            )}

            <CommandDeck 
              leftMapConfig={leftMapConfig}
              rightMapConfig={rightMapConfig}
              onLeftMapConfigChange={setLeftMapConfig}
              onRightMapConfigChange={setRightMapConfig}
              activeFilterSide={activeFilterSide}
              onActiveFilterSideChange={setActiveFilterSide}
              splitMode={splitMode}
              setSplitMode={handleSplitModeChange}
              exaggeration={exaggeration}
              isKatastrActive={isKatastrActive}
              toggleKatastr={() => setIsKatastrActive(!isKatastrActive)}
              katastrOpacity={katastrOpacity}
              setKatastrOpacity={setKatastrOpacity}
              isVrstevniceActive={isVrstevniceActive}
              toggleVrstevnice={() => setIsVrstevniceActive(!isVrstevniceActive)}
              vrstevniceOpacity={vrstevniceOpacity}
              setVrstevniceOpacity={setVrstevniceOpacity}
              filtersOpen={filtersOpen}
              toggleFilters={() => setFiltersOpen(!filtersOpen)}
              filters={visualFilters}
              onFiltersChange={(key, value) => setVisualFilters(prev => ({ ...prev, [key]: value }))}
              filtersEnabled={filtersEnabled}
              toggleFiltersEnabled={() => setFiltersEnabled(!filtersEnabled)}
              onResetFilters={() => setVisualFilters(defaultVisualFilters)}
              isGpsActive={isGpsActive}
              toggleGps={() => setIsGpsActive(!isGpsActive)}
              onLoadSetup={handleLoadSetup}
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
