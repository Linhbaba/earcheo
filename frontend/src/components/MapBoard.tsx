import type { ViewState } from 'react-map-gl/maplibre';
import { SwipeMap, type MapStyleKey } from './SwipeMap';
import type { VisualFilters } from '../types/visualFilters';
import type { UserLocation } from './LocationControl';

interface MapBoardProps {
  mode: 'LIDAR' | 'OPTIC';
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  splitMode: 'vertical' | 'horizontal' | 'none';
  exaggeration?: number;
  isHistoryActive: boolean;
  historyOpacity: number;
  isOrtofotoActive: boolean;
  ortofotoOpacity: number;
  mapStyleKey: MapStyleKey;
  visualFilters: VisualFilters;
  filtersEnabled: boolean;
  userLocation?: UserLocation | null;
}

export const MapBoard = ({ 
    mode, 
    viewState, 
    setViewState, 
    splitMode, 
    exaggeration = 1.5,
    isHistoryActive,
    historyOpacity,
    isOrtofotoActive,
    ortofotoOpacity,
    mapStyleKey,
    visualFilters,
    filtersEnabled,
    userLocation
}: MapBoardProps) => {

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <SwipeMap 
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
    </div>
  );
};
