import { useEffect, useState, useCallback, useRef } from 'react';
import type { ViewState } from 'react-map-gl';
import { Plus, Package, Undo2, X, Hand, Pencil, Check } from 'lucide-react';
import { trackLayerToggle } from '../hooks/useMapAnalytics';
import { AuthHeader, type MapMode } from '../components/AuthHeader';
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
import { SectorPanel } from '../components/sectors';
import { MeasurementTool, ScaleBar, type MeasurementPoint } from '../components/measurement';
import { RulersControl } from '../components/RulersControl';
import { OnboardingWizard } from '../components/onboarding';
import { useIsMobile } from '../hooks/useIsMobile';
import { useProfile } from '../hooks/useProfile';
import { useFindings } from '../hooks/useFindings';
import { useSectors } from '../hooks/useSectors';
import type { VisualFilters } from '../types/visualFilters';
import { defaultVisualFilters } from '../types/visualFilters';
import { SEOHead } from '../components/SEOHead';
import type { Finding, MapSetupConfig, Sector, GeoJSONPolygon, GeoJSONLineString, CollectorType } from '../types/database';
import type { MapSideConfig } from '../types/mapSource';
import { DEFAULT_LEFT_CONFIG, DEFAULT_RIGHT_CONFIG } from '../types/mapSource';
import { coordsToPolygon, isValidPolygon } from '../utils/geometry';

export const MapPage = () => {
  const isMobile = useIsMobile();
  
  // Initialize user profile (creates profile on first login)
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  
  // Onboarding wizard state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingDismissedRef = useRef(false);
  
  // Show onboarding wizard if profile loaded and not completed (only once per session)
  useEffect(() => {
    if (!profileLoading && profile && !profile.onboardingCompleted && !onboardingDismissedRef.current) {
      setShowOnboarding(true);
    }
  }, [profileLoading, profile]);
  
  // Handle onboarding complete
  const handleOnboardingComplete = async (collectorTypes: CollectorType[]) => {
    console.log('[Onboarding] Completing with types:', collectorTypes);
    onboardingDismissedRef.current = true;
    setShowOnboarding(false);
    try {
      const result = await updateProfile({
        collectorTypes,
        onboardingCompleted: true,
      });
      console.log('[Onboarding] Complete - saved profile:', result);
    } catch (error) {
      console.error('Onboarding complete error:', error);
    }
  };
  
  // Handle onboarding skip
  const handleOnboardingSkip = async () => {
    onboardingDismissedRef.current = true;
    setShowOnboarding(false);
    try {
      await updateProfile({
        onboardingCompleted: true,
      });
    } catch (error) {
      console.error('Onboarding skip error:', error);
    }
  };
  
  // Load findings for map markers
  const { findings } = useFindings();
  
  // Load sectors
  const { sectors } = useSectors();
  
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
  const [isPlaceNamesActive, setIsPlaceNamesActive] = useState(false);
  const [placeNamesOpacity, setPlaceNamesOpacity] = useState(0.9);
  const [isSectorsActive, setIsSectorsActive] = useState(true);
  
  // Mode přepínač (Mapa / Plánovač)
  const [mode, setMode] = useState<MapMode>('map');
  
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
  
  // Sector planning state
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isSectorPanelOpen, setIsSectorPanelOpen] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [drawingPolygon, setDrawingPolygon] = useState<[number, number][]>([]);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSONPolygon | null>(null);
  const [isPanningMode, setIsPanningMode] = useState(false); // Spacebar hold for pan
  const [stripPreview, setStripPreview] = useState<GeoJSONLineString[]>([]); // Live strip preview
  const [focusBounds, setFocusBounds] = useState<[[number, number], [number, number]] | null>(null);

  // Measurement state
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [isRulersActive, setIsRulersActive] = useState(false);

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

  // --- LAYER TOGGLE HANDLERS s GA4 trackingem ---
  const handleToggleKatastr = useCallback(() => {
    const newState = !isKatastrActive;
    setIsKatastrActive(newState);
    trackLayerToggle('katastr', newState);
  }, [isKatastrActive]);

  const handleToggleVrstevnice = useCallback(() => {
    const newState = !isVrstevniceActive;
    setIsVrstevniceActive(newState);
    trackLayerToggle('vrstevnice', newState);
  }, [isVrstevniceActive]);

  const handleTogglePlaceNames = useCallback(() => {
    const newState = !isPlaceNamesActive;
    setIsPlaceNamesActive(newState);
    trackLayerToggle('place_names', newState);
  }, [isPlaceNamesActive]);

  const handleToggleSectors = useCallback(() => {
    const newState = !isSectorsActive;
    setIsSectorsActive(newState);
    trackLayerToggle('sectors', newState);
  }, [isSectorsActive]);

  const handleToggleGps = useCallback(() => {
    const newState = !isGpsActive;
    setIsGpsActive(newState);
    trackLayerToggle('gps', newState);
  }, [isGpsActive]);

  const handleSplitModeChange = (mode: 'vertical' | 'horizontal' | 'none') => {
      setSplitMode(mode);
  };

  // Handle mode change - open sector panel in planner mode
  const handleModeChange = (newMode: MapMode) => {
    setMode(newMode);
    if (newMode === 'planner') {
      setIsSectorPanelOpen(true);
    }
  };

  // Focus on sector handler
  const handleFocusSector = (sector: Sector) => {
    const coords = sector.geometry.coordinates[0];
    if (!coords || coords.length < 3) return;

    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    setFocusBounds([
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ]);
  };

  // Polygon drawing handlers
  const handleStartDrawing = () => {
    setIsDrawingPolygon(true);
    setDrawingPolygon([]);
    setDrawnPolygon(null);
    // Vypnout měření pokud je aktivní
    setIsMeasuring(false);
  };

  const handleMapClick = (lngLat: [number, number]) => {
    // Měření má prioritu
    if (isMeasuring) {
      setMeasurementPoints(prev => [...prev, { lng: lngLat[0], lat: lngLat[1] }]);
      return;
    }
    if (!isDrawingPolygon) return;
    setDrawingPolygon(prev => [...prev, lngLat]);
  };

  const handleMapDoubleClick = () => {
    // Měření - ukončit při double-click
    if (isMeasuring) {
      setIsMeasuring(false);
      return;
    }
    if (!isDrawingPolygon || drawingPolygon.length < 3) return;
    handleConfirmPolygon();
  };

  // Measurement handlers - toggle
  const handleToggleMeasuring = () => {
    if (isMeasuring) {
      // Vypnout měření
      setIsMeasuring(false);
      setMeasurementPoints([]);
    } else {
      // Zapnout měření
      setIsMeasuring(true);
      setMeasurementPoints([]);
      // Vypnout kreslení pokud je aktivní
      setIsDrawingPolygon(false);
    }
  };

  const handleClearMeasurement = () => {
    setMeasurementPoints([]);
  };

  const handleCloseMeasurement = () => {
    setIsMeasuring(false);
    setMeasurementPoints([]);
  };

  const handleMeasurementPointMove = (index: number, lng: number, lat: number) => {
    setMeasurementPoints(prev => prev.map((p, i) => 
      i === index ? { lng, lat } : p
    ));
  };

  // Confirm and close the polygon
  const handleConfirmPolygon = () => {
    if (drawingPolygon.length >= 3 && isValidPolygon(drawingPolygon)) {
      setDrawnPolygon(coordsToPolygon(drawingPolygon));
      setIsDrawingPolygon(false);
      setIsPanningMode(false);
    }
  };

  // Remove specific point by index
  const handleRemovePoint = (index: number) => {
    setDrawingPolygon(prev => prev.filter((_, i) => i !== index));
  };

  // Undo last point (right-click)
  const handleUndoLastPoint = () => {
    setDrawingPolygon(prev => prev.slice(0, -1));
  };

  const handleClearDrawing = () => {
    setDrawingPolygon([]);
    setDrawnPolygon(null);
    setIsDrawingPolygon(false);
    setIsPanningMode(false);
    setStripPreview([]);
  };

  // Edit polygon: convert drawnPolygon back to drawing points
  const handleEditPolygon = () => {
    if (drawnPolygon) {
      // Extract coordinates from GeoJSON (remove closing point)
      const coords = drawnPolygon.coordinates[0].slice(0, -1) as [number, number][];
      setDrawingPolygon(coords);
      setDrawnPolygon(null);
      setIsDrawingPolygon(true);
      setStripPreview([]);
    }
  };

  // Spacebar handler for temporary pan mode while drawing
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && isDrawingPolygon && !isPanningMode) {
      e.preventDefault();
      setIsPanningMode(true);
    }
  }, [isDrawingPolygon, isPanningMode]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && isDrawingPolygon) {
      e.preventDefault();
      setIsPanningMode(false);
    }
  }, [isDrawingPolygon]);

  // Attach keyboard listeners
  useEffect(() => {
    if (isDrawingPolygon) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    } else {
      setIsPanningMode(false);
    }
  }, [isDrawingPolygon, handleKeyDown, handleKeyUp]);

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
        description="LiDAR mapa České republiky s ortofoto a historickými snímky. 3D terén, katastrální mapy a nástroje pro průzkum krajiny."
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
              isPlaceNamesActive={isPlaceNamesActive}
              placeNamesOpacity={placeNamesOpacity}
              visualFilters={visualFilters}
              filtersEnabled={filtersEnabled}
              userLocation={userLocation}
              findings={findings}
              onFindingClick={setSelectedFindingFromMap}
              sectors={sectors}
              isSectorsActive={isSectorsActive || mode === 'planner'}
              selectedSectorId={selectedSector?.id}
              drawingPolygon={isDrawingPolygon ? drawingPolygon : undefined}
              drawnPolygon={drawnPolygon}
              stripPreview={stripPreview}
              isDrawingMode={isDrawingPolygon && !isPanningMode}
              onMapClick={(isDrawingPolygon && !isPanningMode) || isMeasuring ? handleMapClick : undefined}
              onMapDoubleClick={(isDrawingPolygon && !isPanningMode) || isMeasuring ? handleMapDoubleClick : undefined}
              onRemovePoint={isDrawingPolygon && !isPanningMode ? handleRemovePoint : undefined}
              onUndoLastPoint={isDrawingPolygon && !isPanningMode ? handleUndoLastPoint : undefined}
              measurementPoints={measurementPoints}
              isMeasuring={isMeasuring}
              onMeasurementPointMove={handleMeasurementPointMove}
              focusBounds={focusBounds}
              onFocusComplete={() => setFocusBounds(null)}
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
              mode={mode}
              onModeChange={handleModeChange}
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
              toggleKatastr={handleToggleKatastr}
              katastrOpacity={katastrOpacity}
              setKatastrOpacity={setKatastrOpacity}
              isVrstevniceActive={isVrstevniceActive}
              toggleVrstevnice={handleToggleVrstevnice}
              vrstevniceOpacity={vrstevniceOpacity}
              setVrstevniceOpacity={setVrstevniceOpacity}
              isPlaceNamesActive={isPlaceNamesActive}
              togglePlaceNames={handleTogglePlaceNames}
              placeNamesOpacity={placeNamesOpacity}
              setPlaceNamesOpacity={setPlaceNamesOpacity}
              filters={visualFilters}
              onFiltersChange={(key, value) => setVisualFilters(prev => ({ ...prev, [key]: value }))}
              filtersEnabled={filtersEnabled}
              toggleFiltersEnabled={() => setFiltersEnabled(!filtersEnabled)}
              onResetFilters={() => setVisualFilters(defaultVisualFilters)}
              isGpsActive={isGpsActive}
              toggleGps={handleToggleGps}
              onCenterGps={() => {
                if (userLocation) {
                  setViewState(prev => ({ ...prev, longitude: userLocation.lng, latitude: userLocation.lat, zoom: 16 }));
                }
              }}
              exaggeration={exaggeration}
              isSectorsActive={isSectorsActive}
              toggleSectors={handleToggleSectors}
              mode={mode}
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
              mode={mode}
              onModeChange={handleModeChange}
            />
            
            {/* Left Side - Add Finding Button (hidden in planner mode) */}
            {mode === 'map' && (
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
            )}
            
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

              {/* Vodítka */}
              <RulersControl
                isActive={isRulersActive}
                onActiveChange={setIsRulersActive}
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
              toggleKatastr={handleToggleKatastr}
              katastrOpacity={katastrOpacity}
              setKatastrOpacity={setKatastrOpacity}
              isVrstevniceActive={isVrstevniceActive}
              toggleVrstevnice={handleToggleVrstevnice}
              vrstevniceOpacity={vrstevniceOpacity}
              setVrstevniceOpacity={setVrstevniceOpacity}
              isPlaceNamesActive={isPlaceNamesActive}
              togglePlaceNames={handleTogglePlaceNames}
              placeNamesOpacity={placeNamesOpacity}
              setPlaceNamesOpacity={setPlaceNamesOpacity}
              filtersOpen={filtersOpen}
              toggleFilters={() => setFiltersOpen(!filtersOpen)}
              filters={visualFilters}
              onFiltersChange={(key, value) => setVisualFilters(prev => ({ ...prev, [key]: value }))}
              filtersEnabled={filtersEnabled}
              toggleFiltersEnabled={() => setFiltersEnabled(!filtersEnabled)}
              onResetFilters={() => setVisualFilters(defaultVisualFilters)}
              isGpsActive={isGpsActive}
              toggleGps={handleToggleGps}
              isSectorsActive={isSectorsActive}
              toggleSectors={handleToggleSectors}
              mode={mode}
              onLoadSetup={handleLoadSetup}
              isMeasuring={isMeasuring}
              toggleMeasuring={handleToggleMeasuring}
            />

            {/* Scale Bar - vlevo dole */}
            <div className="absolute bottom-6 left-6 z-40 pointer-events-none">
              <ScaleBar 
                latitude={viewState.latitude} 
                zoom={viewState.zoom} 
              />
            </div>

            {/* Measurement Tool UI */}
            <MeasurementTool
              points={measurementPoints}
              isActive={isMeasuring}
              onClear={handleClearMeasurement}
              onClose={handleCloseMeasurement}
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

        {/* Sector Panel - only in planner mode */}
        {mode === 'planner' && (
          <SectorPanel
            isOpen={isSectorPanelOpen}
            onClose={() => {
              setIsSectorPanelOpen(false);
              setMode('map');
              setStripPreview([]);
            }}
            onStartDrawing={handleStartDrawing}
            drawnPolygon={drawnPolygon}
            drawingPolygon={drawingPolygon}
            onClearDrawing={handleClearDrawing}
            onEditPolygon={handleEditPolygon}
            onSelectSector={setSelectedSector}
            selectedSector={selectedSector}
            onStripPreviewChange={setStripPreview}
            onFocusSector={handleFocusSector}
          />
        )}

        {/* Drawing Tools Panel - Top Center, aligned with right controls */}
        {isDrawingPolygon && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="bg-surface/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-3 py-2 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2">
                
                {/* Tool Mode Indicator */}
                <div className="flex items-center gap-0.5 bg-black/30 rounded-lg p-0.5">
                  {/* Draw tool */}
                  <div 
                    className={`relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
                      !isPanningMode 
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                        : 'text-white/30'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {!isPanningMode && (
                      <div className="absolute inset-0 rounded-md border border-emerald-400/50" />
                    )}
                  </div>
                  {/* Pan tool */}
                  <div 
                    className={`relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
                      isPanningMode 
                        ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]' 
                        : 'text-white/30'
                    }`}
                  >
                    <Hand className="w-3.5 h-3.5" />
                    {isPanningMode && (
                      <div className="absolute inset-0 rounded-md border border-sky-400/50" />
                    )}
                  </div>
                </div>

                {/* Point count badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  isPanningMode ? 'bg-sky-500/10' : 'bg-emerald-500/10'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isPanningMode ? 'bg-sky-500' : 'bg-emerald-500 animate-pulse'
                  }`} />
                  <span className={`font-mono text-xs font-medium transition-colors ${
                    isPanningMode ? 'text-sky-400' : 'text-emerald-400'
                  }`}>
                    {drawingPolygon.length}
                  </span>
                </div>

                {/* Instructions - compact */}
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/40">
                  {isPanningMode ? (
                    <span className="text-sky-400/70">posun mapy</span>
                  ) : drawingPolygon.length < 3 ? (
                    <span>přidejte min. 3 body</span>
                  ) : (
                    <span className="text-emerald-400/70">hotovo k potvrzení</span>
                  )}
                </div>

                {/* Undo button */}
                {drawingPolygon.length > 0 && !isPanningMode && (
                  <button
                    onClick={handleUndoLastPoint}
                    className="flex items-center justify-center w-6 h-6 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/50 hover:text-white"
                    title="Zpět"
                  >
                    <Undo2 className="w-3 h-3" />
                  </button>
                )}

                {/* Spacebar hint */}
                <kbd className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition-all ${
                  isPanningMode 
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' 
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}>
                  ␣
                </kbd>

                {/* Confirm button - only when 3+ points */}
                {drawingPolygon.length >= 3 && !isPanningMode && (
                  <button
                    onClick={handleConfirmPolygon}
                    className="flex items-center justify-center w-7 h-7 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-emerald-400 hover:text-emerald-300 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    title="Potvrdit polygon"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                {/* Cancel button */}
                <button
                  onClick={handleClearDrawing}
                  className="flex items-center justify-center w-6 h-6 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400/70 hover:text-red-400 transition-colors"
                  title="Zrušit"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Wizard */}
        <OnboardingWizard
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    </>
  );
};
