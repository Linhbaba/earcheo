import React, { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import type { ViewState, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Move, MapPin } from 'lucide-react';
import type { VisualFilters } from '../types/visualFilters';
import type { UserLocation } from './LocationControl';
import type { Finding } from '../types/database';
import type { MapSideConfig, MapSourceType } from '../types/mapSource';

// WMS Proxy URLs
const LIDAR_HILLSHADE_URL = '/api/wms-proxy?service=WMS&version=1.1.1&request=GetMap&layers=dmr5g:GrayscaleHillshade&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';
const ORTOFOTO_URL = '/api/ortofoto-proxy?service=WMS&version=1.1.1&request=GetMap&layers=GR_ORTFOTORGB&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';
const KATASTR_URL = '/api/katastr-proxy?service=WMS&version=1.1.1&request=GetMap&layers=RST_KMD,RST_KN,obrazy_parcel_i,obrazy_parcel,hranice_parcel_i,hranice_parcel,DEF_BUDOVY&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';
const VRSTEVNICE_URL = '/api/zabaged-proxy?service=WMS&version=1.1.1&request=GetMap&layers=0,1,2,3&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';

// Archiv URL s dynamickým rokem
const getArchiveUrl = (year: number) => 
  `/api/ortofoto-archive-proxy?service=WMS&version=1.1.1&request=GetMap&layers=${year}&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true`;

// Map Styles
const STYLE_SATELLITE = {
  version: 8 as const,
  sources: {
    'esri-satellite': {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }
  },
  layers: [
    { id: 'background', type: 'background' as const, paint: { 'background-color': '#000' } },
    { id: 'satellite-layer', type: 'raster' as const, source: 'esri-satellite', paint: { 'raster-opacity': 1 } }
  ]
};

const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const STYLE_STREET = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

// Získat mapStyle podle typu zdroje
const getMapStyle = (source: MapSourceType): string | object => {
  switch (source) {
    case 'LIDAR':
    case 'SATELLITE':
    case 'ORTOFOTO':
    case 'ARCHIVE':
      // Satelitní mapa jako podklad (pro oblasti mimo ČR)
      return STYLE_SATELLITE;
    case 'DARK':
      return STYLE_DARK;
    case 'CLASSIC':
      return STYLE_STREET;
    default:
      return STYLE_SATELLITE;
  }
};

interface SwipeMapProps {
  leftMapConfig: MapSideConfig;
  rightMapConfig: MapSideConfig;
  activeFilterSide: 'left' | 'right';
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  splitMode?: 'vertical' | 'horizontal' | 'none';
  exaggeration?: number;
  isKatastrActive?: boolean;
  katastrOpacity?: number;
  isVrstevniceActive?: boolean;
  vrstevniceOpacity?: number;
  visualFilters: VisualFilters;
  filtersEnabled: boolean;
  userLocation?: UserLocation | null;
  findings?: Finding[];
  onFindingClick?: (finding: Finding) => void;
}

export const SwipeMap = ({ 
  leftMapConfig,
  rightMapConfig,
  activeFilterSide,
  viewState, 
  setViewState, 
  splitMode = 'vertical',
  exaggeration = 1.5,
  isKatastrActive = false,
  katastrOpacity = 0.6,
  isVrstevniceActive = false,
  vrstevniceOpacity = 0.7,
  visualFilters,
  filtersEnabled,
  userLocation,
  findings = [],
  onFindingClick
}: SwipeMapProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const leftMapRef = useRef<MapRef>(null);
  const rightMapRef = useRef<MapRef>(null);

  // --- DRAG HANDLERS ---
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const axisSize = splitMode === 'horizontal' ? window.innerHeight : window.innerWidth;
    const coord = splitMode === 'horizontal' ? e.clientY : e.clientX;
    setSliderPosition(Math.min(Math.max((coord / axisSize) * 100, 0), 100));
  }, [isDragging, splitMode]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    const axisSize = splitMode === 'horizontal' ? window.innerHeight : window.innerWidth;
    const coord = splitMode === 'horizontal' ? e.touches[0].clientY : e.touches[0].clientX;
    setSliderPosition(Math.min(Math.max((coord / axisSize) * 100, 0), 100));
  }, [isDragging, splitMode]);

  const onTouchEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  // --- FILTER STYLE ---
  const getFilterStyle = (side: 'left' | 'right') => {
    if (!filtersEnabled || activeFilterSide !== side) return {};
    return {
      filter: `
        invert(${visualFilters.invert}%) 
        contrast(${visualFilters.contrast}%) 
        saturate(${visualFilters.saturation}%) 
        brightness(${visualFilters.brightness}%)
        hue-rotate(${visualFilters.hue}deg)
      `.trim()
    };
  };

  // --- GPS MARKER ---
  const renderGpsMarker = () => userLocation && (
    <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
      <div className="relative pointer-events-none">
        <div className="absolute w-8 h-8 bg-primary/30 rounded-full animate-ping" style={{ left: '-16px', top: '-16px' }} />
        <div className="absolute w-6 h-6 bg-primary/50 rounded-full border-2 border-primary shadow-lg" style={{ left: '-12px', top: '-12px' }} />
        <div className="absolute w-2 h-2 bg-white rounded-full" style={{ left: '-4px', top: '-4px' }} />
      </div>
    </Marker>
  );

  // --- FINDING MARKERS ---
  const renderFindingMarkers = () => findings.map((finding) => {
    const firstCategory = finding.category?.split(',')[0].trim().toLowerCase() || '';
    const colors: Record<string, string> = {
      'mince': '#ffae00', 'coins': '#ffae00',
      'nástroje': '#9ca3af', 'tools': '#9ca3af',
      'keramika': '#f97316', 'pottery': '#f97316',
      'šperky': '#a855f7', 'jewelry': '#a855f7',
      'zbraně': '#ef4444', 'weapons': '#ef4444',
    };
    const color = colors[firstCategory] || '#00f3ff';
    const thumbnail = finding.images?.[0]?.thumbnailUrl;

    return (
      <Marker
        key={finding.id}
        longitude={finding.longitude}
        latitude={finding.latitude}
        anchor="bottom"
        onClick={(e) => { e.originalEvent.stopPropagation(); onFindingClick?.(finding); }}
      >
        <div className="relative group cursor-pointer pointer-events-auto">
          {thumbnail ? (
            <div className="relative">
              <div className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color, width: '48px', height: '48px', left: '0', top: '0' }} />
              <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg group-hover:scale-110 transition-transform" style={{ borderColor: color, borderWidth: '3px' }}>
                <img src={thumbnail} alt={finding.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid ${color}` }} />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color, width: '32px', height: '32px', left: '0', top: '0' }} />
              <div className="relative w-8 h-8 flex items-center justify-center" style={{ color }}>
                <MapPin className="w-8 h-8 drop-shadow-lg group-hover:scale-125 transition-transform" fill={color} strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>
      </Marker>
    );
  });

  // --- OVERLAY LAYERS (Katastr, Vrstevnice) ---
  const renderOverlayLayers = () => (
    <>
      {isKatastrActive && (
        <Source id="katastr-wms" type="raster" tiles={[KATASTR_URL]} tileSize={256}>
          <Layer id="katastr-layer" type="raster" paint={{ 'raster-opacity': katastrOpacity }} />
        </Source>
      )}
      {isVrstevniceActive && (
        <Source id="vrstevnice-wms" type="raster" tiles={[VRSTEVNICE_URL]} tileSize={256}>
          <Layer id="vrstevnice-layer" type="raster" paint={{ 'raster-opacity': vrstevniceOpacity }} />
        </Source>
      )}
    </>
  );

  // --- MAP CONTENT based on config ---
  const renderMapContent = (config: MapSideConfig, side: 'left' | 'right') => {
    const { source, archiveYear } = config;

    return (
      <>
        {/* Terrain DEM pro 3D efekt */}
        <Source id={`terrain-dem-${side}`} type="raster-dem" tiles={['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']} encoding="terrarium" tileSize={256} maxzoom={15} />

        {/* LiDAR Hillshade */}
        {source === 'LIDAR' && (
          <Source id={`lidar-hillshade-${side}`} type="raster" tiles={[LIDAR_HILLSHADE_URL]} tileSize={256}>
            <Layer id={`lidar-layer-${side}`} type="raster" paint={{ 'raster-opacity': 1 }} />
          </Source>
        )}

        {/* Ortofoto ČÚZK */}
        {source === 'ORTOFOTO' && (
          <Source id={`ortofoto-${side}`} type="raster" tiles={[ORTOFOTO_URL]} tileSize={256}>
            <Layer id={`ortofoto-layer-${side}`} type="raster" paint={{ 'raster-opacity': 1 }} />
          </Source>
        )}

        {/* Archivní ortofoto */}
        {source === 'ARCHIVE' && archiveYear && (
          <Source id={`archive-${side}`} type="raster" tiles={[getArchiveUrl(archiveYear)]} tileSize={256}>
            <Layer id={`archive-layer-${side}`} type="raster" paint={{ 'raster-opacity': 1 }} />
          </Source>
        )}

        {/* Overlay vrstvy */}
        {renderOverlayLayers()}

        {/* GPS marker */}
        {renderGpsMarker()}

        {/* Finding markers */}
        {renderFindingMarkers()}
      </>
    );
  };

  // --- RENDER MAPS ---
  const renderMap = (config: MapSideConfig, side: 'left' | 'right', ref: React.RefObject<MapRef>) => (
    <Map
      ref={ref}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle={getMapStyle(config.source) as any}
      terrain={{ source: `terrain-dem-${side}`, exaggeration }}
      style={getFilterStyle(side)}
    >
      {renderMapContent(config, side)}
    </Map>
  );

  // --- FULLSCREEN MODE (only left map) ---
  if (splitMode === 'none') {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0" style={getFilterStyle('left')}>
          {renderMap(leftMapConfig, 'left', leftMapRef)}
        </div>
      </div>
    );
  }

  // --- SPLIT MODE ---
  const isHorizontal = splitMode === 'horizontal';
  const clipLeft = isHorizontal
    ? `inset(0 0 ${100 - sliderPosition}% 0)`
    : `inset(0 ${100 - sliderPosition}% 0 0)`;
  const clipRight = isHorizontal
    ? `inset(${sliderPosition}% 0 0 0)`
    : `inset(0 0 0 ${sliderPosition}%)`;

  return (
    <div className="relative w-full h-full">
      {/* Left Map */}
      <div className="absolute inset-0" style={{ clipPath: clipLeft, ...getFilterStyle('left') }}>
        {renderMap(leftMapConfig, 'left', leftMapRef)}
      </div>

      {/* Right Map */}
      <div className="absolute inset-0" style={{ clipPath: clipRight, ...getFilterStyle('right') }}>
        {renderMap(rightMapConfig, 'right', rightMapRef)}
      </div>

      {/* Slider */}
      <div
        className="absolute z-30 cursor-col-resize group"
        style={isHorizontal
          ? { top: `${sliderPosition}%`, left: 0, right: 0, height: '12px', transform: 'translateY(-50%)', cursor: 'row-resize' }
          : { left: `${sliderPosition}%`, top: 0, bottom: 0, width: '12px', transform: 'translateX(-50%)' }
        }
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Slider line */}
        <div className={`absolute bg-primary/80 group-hover:bg-primary transition-all ${isHorizontal ? 'left-0 right-0 h-0.5 top-1/2 -translate-y-1/2' : 'top-0 bottom-0 w-0.5 left-1/2 -translate-x-1/2'}`} />
        
        {/* Handle */}
        <div className={`absolute bg-surface/90 border-2 border-primary rounded-full shadow-lg flex items-center justify-center ${isHorizontal ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-6' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-10'}`}>
          <Move className={`text-primary ${isHorizontal ? 'w-5 h-3 rotate-90' : 'w-3 h-5'}`} />
        </div>

        {/* Labels */}
        <div className={`absolute pointer-events-none ${isHorizontal ? 'left-4 top-1/2 -translate-y-1/2' : 'top-4 left-1/2 -translate-x-1/2'}`}>
          <span className="text-[10px] font-mono text-primary bg-surface/80 px-1.5 py-0.5 rounded">L</span>
        </div>
        <div className={`absolute pointer-events-none ${isHorizontal ? 'right-4 top-1/2 -translate-y-1/2' : 'bottom-4 left-1/2 -translate-x-1/2'}`}>
          <span className="text-[10px] font-mono text-primary bg-surface/80 px-1.5 py-0.5 rounded">R</span>
        </div>
      </div>
    </div>
  );
};
