import type { ViewState } from 'react-map-gl/maplibre';
import { SwipeMap } from './SwipeMap';
import type { VisualFilters } from '../types/visualFilters';
import type { UserLocation } from './LocationControl';
import type { Finding, Sector } from '../types/database';
import type { MapSideConfig } from '../types/mapSource';

interface MapBoardProps {
  // Nový L/R systém
  leftMapConfig: MapSideConfig;
  rightMapConfig: MapSideConfig;
  activeFilterSide: 'left' | 'right';
  // Pohled
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  splitMode: 'vertical' | 'horizontal' | 'none';
  exaggeration?: number;
  // Overlay vrstvy
  isKatastrActive: boolean;
  katastrOpacity: number;
  isVrstevniceActive: boolean;
  vrstevniceOpacity: number;
  // Filtry
  visualFilters: VisualFilters;
  filtersEnabled: boolean;
  // Ostatní
  userLocation?: UserLocation | null;
  findings?: Finding[];
  onFindingClick?: (finding: Finding) => void;
  // Sectors
  sectors?: Sector[];
  isSectorsActive?: boolean;
  selectedSectorId?: string | null;
  drawingPolygon?: [number, number][];
  drawnPolygon?: import('../types/database').GeoJSONPolygon | null;
  stripPreview?: import('../types/database').GeoJSONLineString[];
  isDrawingMode?: boolean;
  onMapClick?: (lngLat: [number, number]) => void;
  onMapDoubleClick?: () => void;
  onRemovePoint?: (index: number) => void;
  onUndoLastPoint?: () => void;
}

export const MapBoard = ({ 
    leftMapConfig,
    rightMapConfig,
    activeFilterSide,
    viewState, 
    setViewState, 
    splitMode, 
    exaggeration = 1.5,
    isKatastrActive,
    katastrOpacity,
    isVrstevniceActive,
    vrstevniceOpacity,
    visualFilters,
    filtersEnabled,
    userLocation,
    findings,
    onFindingClick,
    sectors,
    isSectorsActive,
    selectedSectorId,
    drawingPolygon,
    drawnPolygon,
    stripPreview,
    isDrawingMode,
    onMapClick,
    onMapDoubleClick,
    onRemovePoint,
    onUndoLastPoint,
}: MapBoardProps) => {

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <SwipeMap 
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
        onFindingClick={onFindingClick}
        sectors={sectors}
        isSectorsActive={isSectorsActive}
        selectedSectorId={selectedSectorId}
        drawingPolygon={drawingPolygon}
        drawnPolygon={drawnPolygon}
        stripPreview={stripPreview}
        isDrawingMode={isDrawingMode}
        onMapClick={onMapClick}
        onMapDoubleClick={onMapDoubleClick}
        onRemovePoint={onRemovePoint}
        onUndoLastPoint={onUndoLastPoint}
      />
    </div>
  );
};
