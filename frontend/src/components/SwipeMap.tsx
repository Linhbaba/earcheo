import React, { useState, useRef, useEffect, useCallback } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import type { ViewState, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Move, MapPin } from 'lucide-react';
import type { VisualFilters } from '../types/visualFilters';
import type { UserLocation } from './LocationControl';
import type { Finding, Sector, GeoJSONPolygon, GeoJSONLineString } from '../types/database';
import type { MapSideConfig, MapSourceType } from '../types/mapSource';

// WMS Proxy URLs (unified proxy endpoint)
const LIDAR_HILLSHADE_URL = '/api/proxy?type=wms&service=WMS&version=1.1.1&request=GetMap&layers=dmr5g:GrayscaleHillshade&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';
const ORTOFOTO_URL = '/api/proxy?type=ortofoto&service=WMS&version=1.1.1&request=GetMap&layers=GR_ORTFOTORGB&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';
const KATASTR_URL = '/api/proxy?type=katastr&service=WMS&version=1.1.1&request=GetMap&layers=RST_KMD,RST_KN,obrazy_parcel_i,obrazy_parcel,hranice_parcel_i,hranice_parcel,DEF_BUDOVY&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';
const VRSTEVNICE_URL = '/api/proxy?type=zabaged&service=WMS&version=1.1.1&request=GetMap&layers=0,1,2,3&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';

// Archiv URL s dynamickým rokem
const getArchiveUrl = (year: number) => 
  `/api/proxy?type=archive&year=${year}&service=WMS&version=1.1.1&request=GetMap&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true`;

// Place Names (názvy měst a obcí) - Stadia Maps Terrain Labels
const PLACE_NAMES_URL = 'https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}.png';

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

// --- GA4 TRACKING ---
const MOVE_THROTTLE_MS = 2000; // Max 1× za 2 sekundy

const sendGAEvent = (eventName: string, params: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    if (import.meta.env.DEV) {
      console.log(`[GA4] ${eventName}`, JSON.stringify(params));
    }
  }
};

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
  isPlaceNamesActive?: boolean;
  placeNamesOpacity?: number;
  visualFilters: VisualFilters;
  filtersEnabled: boolean;
  userLocation?: UserLocation | null;
  findings?: Finding[];
  onFindingClick?: (finding: Finding) => void;
  // Sector support
  sectors?: Sector[];
  isSectorsActive?: boolean;
  selectedSectorId?: string | null;
  drawingPolygon?: [number, number][];
  drawnPolygon?: GeoJSONPolygon | null;
  stripPreview?: GeoJSONLineString[];
  isDrawingMode?: boolean;
  onMapClick?: (lngLat: [number, number]) => void;
  onMapDoubleClick?: () => void;
  onRemovePoint?: (index: number) => void;
  onUndoLastPoint?: () => void;
  // Measurement support
  measurementPoints?: { lng: number; lat: number }[];
  isMeasuring?: boolean;
  onMeasurementPointMove?: (index: number, lng: number, lat: number) => void;
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
  isPlaceNamesActive = false,
  placeNamesOpacity = 0.9,
  visualFilters,
  filtersEnabled,
  userLocation,
  findings = [],
  onFindingClick,
  sectors = [],
  isSectorsActive = false,
  selectedSectorId = null,
  drawingPolygon = [],
  drawnPolygon = null,
  stripPreview = [],
  isDrawingMode = false,
  onMapClick,
  onMapDoubleClick,
  onRemovePoint,
  onUndoLastPoint,
  measurementPoints = [],
  isMeasuring = false,
  onMeasurementPointMove,
}: SwipeMapProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const leftMapRef = useRef<MapRef>(null);
  const rightMapRef = useRef<MapRef>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- GA4 TRACKING REFS & STATE ---
  const lastMoveEventRef = useRef<number>(0);
  const isZoomingRef = useRef(false);

  // GA4: Track zoom start
  const handleGAZoomStart = useCallback(() => {
    const map = leftMapRef.current?.getMap();
    if (!map || isZoomingRef.current) return;
    isZoomingRef.current = true;
    const center = map.getCenter();
    sendGAEvent('map_zoom_start', {
      zoom: parseFloat(map.getZoom().toFixed(2)),
      lng: parseFloat(center.lng.toFixed(6)),
      lat: parseFloat(center.lat.toFixed(6)),
    });
  }, []);

  // GA4: Track zoom end
  const handleGAZoomEnd = useCallback(() => {
    const map = leftMapRef.current?.getMap();
    if (!map || !isZoomingRef.current) return;
    isZoomingRef.current = false;
    const center = map.getCenter();
    sendGAEvent('map_zoom_end', {
      zoom: parseFloat(map.getZoom().toFixed(2)),
      lng: parseFloat(center.lng.toFixed(6)),
      lat: parseFloat(center.lat.toFixed(6)),
    });
  }, []);

  // GA4: Track map move (throttled)
  const handleGAMoveEnd = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveEventRef.current < MOVE_THROTTLE_MS) return;
    if (isZoomingRef.current) return;

    const map = leftMapRef.current?.getMap();
    if (!map) return;

    lastMoveEventRef.current = now;
    const center = map.getCenter();
    sendGAEvent('map_move', {
      zoom: parseFloat(map.getZoom().toFixed(2)),
      center_lng: parseFloat(center.lng.toFixed(6)),
      center_lat: parseFloat(center.lat.toFixed(6)),
    });
  }, []);

  // GA4: Připojení listenerů k mapě
  useEffect(() => {
    const map = leftMapRef.current?.getMap();
    if (!map) return;

    map.on('zoomstart', handleGAZoomStart);
    map.on('zoomend', handleGAZoomEnd);
    map.on('moveend', handleGAMoveEnd);

    // Layer click tracking pro interaktivní vrstvy
    const interactiveLayers = ['sectors-fill', 'tracks-lines'];
    const layerClickHandlers: Record<string, (e: maplibregl.MapMouseEvent) => void> = {};

    interactiveLayers.forEach((layerName) => {
      const handler = (e: maplibregl.MapMouseEvent & { features?: Array<{ id?: string | number; properties?: Record<string, unknown> }> }) => {
        const feature = e.features?.[0];
        sendGAEvent('layer_click', {
          layer: layerName,
          feature_id: feature?.id,
          name: typeof feature?.properties?.name === 'string' ? feature.properties.name.slice(0, 100) : undefined,
          type: typeof feature?.properties?.type === 'string' ? feature.properties.type.slice(0, 50) : undefined,
        });
      };
      layerClickHandlers[layerName] = handler;
      // Přidáme listener pouze pokud vrstva existuje
      if (map.getLayer(layerName)) {
        map.on('click', layerName, handler);
      }
    });

    return () => {
      map.off('zoomstart', handleGAZoomStart);
      map.off('zoomend', handleGAZoomEnd);
      map.off('moveend', handleGAMoveEnd);

      interactiveLayers.forEach((layerName) => {
        const handler = layerClickHandlers[layerName];
        if (handler && map.getLayer(layerName)) {
          map.off('click', layerName, handler);
        }
      });
    };
  }, [leftMapRef.current, handleGAZoomStart, handleGAZoomEnd, handleGAMoveEnd]);

  // --- POINTER EVENTS HANDLER (funguje pro mouse i touch) ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const slider = sliderRef.current;
    if (!slider) return;
    
    // Capture all pointer events to this element
    slider.setPointerCapture(e.pointerId);
    
    document.documentElement.classList.add('dragging-slider');
    document.body.classList.add('dragging-slider');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Pouze pokud máme pointer capture
    const slider = sliderRef.current;
    if (!slider || !slider.hasPointerCapture(e.pointerId)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const axisSize = splitMode === 'horizontal' ? window.innerHeight : window.innerWidth;
    const coord = splitMode === 'horizontal' ? e.clientY : e.clientX;
    setSliderPosition(Math.min(Math.max((coord / axisSize) * 100, 0), 100));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    if (slider.hasPointerCapture(e.pointerId)) {
      slider.releasePointerCapture(e.pointerId);
    }
    
    document.documentElement.classList.remove('dragging-slider');
    document.body.classList.remove('dragging-slider');
  };

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

  // --- FINDING MARKERS (Fancy Design) ---
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
    
    // Zkrátit název pro label
    const shortTitle = finding.title.length > 18 ? finding.title.substring(0, 16) + '...' : finding.title;

    return (
      <Marker
        key={finding.id}
        longitude={finding.longitude}
        latitude={finding.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          // GA4: Track finding marker click
          sendGAEvent('layer_click', {
            layer: 'findings',
            feature_id: finding.id,
            name: finding.title?.slice(0, 100),
            type: finding.category?.split(',')[0]?.trim(),
          });
          onFindingClick?.(finding);
        }}
      >
        <div className="relative group cursor-pointer pointer-events-auto flex flex-col items-center">
          {/* Marker Icon */}
          {thumbnail ? (
            <div className="relative">
              {/* Animated glow ring */}
              <div 
                className="absolute -inset-2 rounded-full opacity-40 group-hover:opacity-80 transition-all duration-300 animate-pulse"
                style={{ 
                  background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                  boxShadow: `0 0 20px ${color}50`
                }} 
              />
              {/* Image container */}
              <div 
                className="relative w-11 h-11 rounded-full overflow-hidden group-hover:scale-110 transition-all duration-300"
                style={{ 
                  borderColor: color, 
                  borderWidth: '2px',
                  boxShadow: `0 0 15px ${color}60, 0 4px 12px rgba(0,0,0,0.4)`
                }}
              >
                <img src={thumbnail} alt={finding.title} className="w-full h-full object-cover" />
              </div>
              {/* Arrow pointer */}
              <div 
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0" 
                style={{ 
                  borderLeft: '6px solid transparent', 
                  borderRight: '6px solid transparent', 
                  borderTop: `8px solid ${color}` 
                }} 
              />
            </div>
          ) : (
            <div className="relative">
              {/* Animated glow ring */}
              <div 
                className="absolute -inset-3 rounded-full opacity-30 group-hover:opacity-70 transition-all duration-300"
                style={{ 
                  background: `radial-gradient(circle, ${color}50 0%, transparent 70%)`,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} 
              />
              {/* Pin icon */}
              <div 
                className="relative flex items-center justify-center group-hover:scale-125 transition-all duration-300" 
                style={{ color }}
              >
                <MapPin 
                  className="w-9 h-9" 
                  fill={color} 
                  strokeWidth={1.5}
                  style={{ 
                    filter: `drop-shadow(0 0 8px ${color}80) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Floating Label */}
          <div 
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-1"
          >
            <div 
              className="px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide backdrop-blur-md border"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                borderColor: `${color}40`,
                color: color,
                boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${color}20`
              }}
            >
              {shortTitle}
            </div>
          </div>

          {/* Hover Tooltip (appears above) */}
          <div 
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 transform scale-95 group-hover:scale-100"
          >
            <div 
              className="px-3 py-2 rounded-lg backdrop-blur-md border min-w-[140px] max-w-[200px]"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: `${color}30`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${color}15`
              }}
            >
              <div className="text-xs font-mono text-white/90 font-medium truncate">{finding.title}</div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: `${color}cc` }}>
                {finding.category}
              </div>
              {finding.date && (
                <div className="text-[9px] font-mono text-white/50 mt-1">
                  {new Date(finding.date).toLocaleDateString('cs-CZ')}
                </div>
              )}
            </div>
            {/* Tooltip arrow */}
            <div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRight: `1px solid ${color}30`, borderBottom: `1px solid ${color}30` }}
            />
          </div>
        </div>
      </Marker>
    );
  });

  // --- OVERLAY LAYERS (Katastr, Vrstevnice, Place Names) ---
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
      {isPlaceNamesActive && (
        <Source id="place-names" type="raster" tiles={[PLACE_NAMES_URL]} tileSize={256}>
          <Layer id="place-names-layer" type="raster" paint={{ 'raster-opacity': placeNamesOpacity }} />
        </Source>
      )}
    </>
  );

  // --- SECTORS LAYERS ---
  const renderSectorsLayers = () => {
    if (!isSectorsActive || sectors.length === 0) return null;

    // Convert sectors to GeoJSON FeatureCollection
    const sectorsGeoJSON = {
      type: 'FeatureCollection' as const,
      features: sectors.map(sector => ({
        type: 'Feature' as const,
        properties: {
          id: sector.id,
          name: sector.name,
          isSelected: sector.id === selectedSectorId,
        },
        geometry: sector.geometry,
      })),
    };

    // Tracks from all sectors
    const tracksFeatures = sectors.flatMap(sector => 
      (sector.tracks || []).map(track => ({
        type: 'Feature' as const,
        properties: {
          id: track.id,
          sectorId: sector.id,
          status: track.status,
          isSelected: sector.id === selectedSectorId,
        },
        geometry: track.geometry,
      }))
    );

    const tracksGeoJSON = {
      type: 'FeatureCollection' as const,
      features: tracksFeatures,
    };

    return (
      <>
        {/* Sector Polygons */}
        <Source id="sectors-source" type="geojson" data={sectorsGeoJSON}>
          {/* Fill */}
          <Layer
            id="sectors-fill"
            type="fill"
            paint={{
              'fill-color': [
                'case',
                ['get', 'isSelected'],
                'rgba(16, 185, 129, 0.25)',
                'rgba(16, 185, 129, 0.1)'
              ],
              'fill-opacity': 0.8,
            }}
          />
          {/* Outline */}
          <Layer
            id="sectors-outline"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['get', 'isSelected'],
                '#10b981',
                '#10b981'
              ],
              'line-width': [
                'case',
                ['get', 'isSelected'],
                3,
                2
              ],
              'line-opacity': [
                'case',
                ['get', 'isSelected'],
                1,
                0.6
              ],
            }}
          />
        </Source>

        {/* Tracks */}
        {tracksFeatures.length > 0 && (
          <Source id="tracks-source" type="geojson" data={tracksGeoJSON}>
            <Layer
              id="tracks-lines"
              type="line"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'status'],
                  'PENDING', '#9ca3af',
                  'IN_PROGRESS', '#3b82f6',
                  'COMPLETED', '#10b981',
                  'SKIPPED', '#f59e0b',
                  '#9ca3af'
                ],
                'line-width': [
                  'case',
                  ['get', 'isSelected'],
                  3,
                  2
                ],
                'line-opacity': [
                  'case',
                  ['get', 'isSelected'],
                  1,
                  0.5
                ],
              }}
            />
          </Source>
        )}
      </>
    );
  };

  // --- DRAWING POLYGON LAYER ---
  const renderDrawingPolygon = () => {
    if (drawingPolygon.length === 0) return null;

    const isComplete = drawingPolygon.length >= 3;
    
    // Create GeoJSON for the drawing
    const drawingGeoJSON = isComplete ? {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[...drawingPolygon, drawingPolygon[0]]],
          },
        },
      ],
    } : null;

    const lineGeoJSON = drawingPolygon.length >= 2 ? {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: drawingPolygon,
      },
    } : null;

    return (
      <>
        {/* Polygon fill (only if 3+ points) */}
        {drawingGeoJSON && (
          <Source id="drawing-polygon-source" type="geojson" data={drawingGeoJSON}>
            <Layer
              id="drawing-polygon-fill"
              type="fill"
              paint={{
                'fill-color': 'rgba(16, 185, 129, 0.2)',
                'fill-opacity': 0.8,
              }}
            />
            <Layer
              id="drawing-polygon-outline"
              type="line"
              paint={{
                'line-color': '#10b981',
                'line-width': 2,
                'line-dasharray': [2, 2],
              }}
            />
          </Source>
        )}

        {/* Line connecting points */}
        {lineGeoJSON && (
          <Source id="drawing-line-source" type="geojson" data={lineGeoJSON}>
            <Layer
              id="drawing-line"
              type="line"
              paint={{
                'line-color': '#10b981',
                'line-width': 2,
                'line-dasharray': [4, 2],
              }}
            />
          </Source>
        )}

        {/* Interactive Point Markers */}
        {drawingPolygon.map((coord, index) => {
          const isFirst = index === 0;
          const isLast = index === drawingPolygon.length - 1;
          
          return (
            <Marker
              key={`drawing-point-${index}`}
              longitude={coord[0]}
              latitude={coord[1]}
              anchor="center"
            >
              <div 
                className="relative group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePoint?.(index);
                }}
                title={`Bod ${index + 1} - klikni pro odstranění`}
              >
                {/* Glow effect */}
                <div 
                  className={`absolute -inset-1 rounded-full opacity-50 group-hover:opacity-100 transition-all ${
                    isFirst ? 'bg-emerald-400/40' : isLast ? 'bg-amber-400/40' : 'bg-emerald-400/30'
                  }`}
                />
                {/* Point */}
                <div 
                  className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-125 ${
                    isFirst 
                      ? 'bg-emerald-500' 
                      : isLast 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-400'
                  }`}
                />
                {/* Index label */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-surface/90 backdrop-blur-sm text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap border border-white/10">
                    {isFirst ? '1' : index + 1}
                  </div>
                </div>
                {/* Remove indicator on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-0.5 bg-white rounded" />
                </div>
              </div>
            </Marker>
          );
        })}
      </>
    );
  };

  // --- CONFIRMED POLYGON LAYER (after user confirms drawing) ---
  const renderDrawnPolygon = () => {
    if (!drawnPolygon) return null;

    const polygonGeoJSON = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: drawnPolygon,
        },
      ],
    };

    return (
      <Source id="drawn-polygon-source" type="geojson" data={polygonGeoJSON}>
        <Layer
          id="drawn-polygon-fill"
          type="fill"
          paint={{
            'fill-color': 'rgba(16, 185, 129, 0.1)',
            'fill-opacity': 1,
          }}
        />
        <Layer
          id="drawn-polygon-outline"
          type="line"
          paint={{
            'line-color': '#10b981',
            'line-width': 2,
            'line-opacity': 0.8,
          }}
        />
      </Source>
    );
  };

  // --- STRIP PREVIEW LAYER (snake route preview) ---
  const renderStripPreview = () => {
    if (!stripPreview || stripPreview.length === 0) return null;

    const stripsGeoJSON = {
      type: 'FeatureCollection' as const,
      features: stripPreview.map((strip, index) => ({
        type: 'Feature' as const,
        properties: { 
          index,
          isEven: index % 2 === 0,
        },
        geometry: strip,
      })),
    };

    // Create connecting lines between strips (snake pattern)
    const connectionsGeoJSON = {
      type: 'FeatureCollection' as const,
      features: stripPreview.slice(0, -1).map((strip, index) => {
        const nextStrip = stripPreview[index + 1];
        // Connect end of current strip to start of next strip
        const currentEnd = strip.coordinates[strip.coordinates.length - 1];
        const nextStart = nextStrip.coordinates[0];
        return {
          type: 'Feature' as const,
          properties: { index },
          geometry: {
            type: 'LineString' as const,
            coordinates: [currentEnd, nextStart],
          },
        };
      }),
    };

    return (
      <>
        {/* Strip lines */}
        <Source id="strip-preview-source" type="geojson" data={stripsGeoJSON}>
          <Layer
            id="strip-preview-lines"
            type="line"
            paint={{
              'line-color': '#f59e0b', // amber
              'line-width': 2,
              'line-opacity': 0.8,
            }}
          />
        </Source>

        {/* Connection lines (snake turns) */}
        <Source id="strip-connections-source" type="geojson" data={connectionsGeoJSON}>
          <Layer
            id="strip-connections-lines"
            type="line"
            paint={{
              'line-color': '#f59e0b',
              'line-width': 1.5,
              'line-opacity': 0.5,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>

        {/* Start/End markers */}
        {stripPreview.length > 0 && (
          <>
            <Marker
              longitude={stripPreview[0].coordinates[0][0]}
              latitude={stripPreview[0].coordinates[0][1]}
              anchor="center"
            >
              <div className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">S</span>
              </div>
            </Marker>
            <Marker
              longitude={stripPreview[stripPreview.length - 1].coordinates[stripPreview[stripPreview.length - 1].coordinates.length - 1][0]}
              latitude={stripPreview[stripPreview.length - 1].coordinates[stripPreview[stripPreview.length - 1].coordinates.length - 1][1]}
              anchor="center"
            >
              <div className="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">E</span>
              </div>
            </Marker>
          </>
        )}
      </>
    );
  };

  // --- MEASUREMENT LINE LAYER ---
  const renderMeasurementLine = () => {
    if (measurementPoints.length === 0) return null;

    const lineGeoJSON = measurementPoints.length >= 2 ? {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: measurementPoints.map(p => [p.lng, p.lat]),
      },
    } : null;

    return (
      <>
        {/* Measurement line */}
        {lineGeoJSON && (
          <Source id="measurement-line-source" type="geojson" data={lineGeoJSON}>
            <Layer
              id="measurement-line-glow"
              type="line"
              paint={{
                'line-color': '#f59e0b',
                'line-width': 6,
                'line-opacity': 0.3,
                'line-blur': 3,
              }}
            />
            <Layer
              id="measurement-line"
              type="line"
              paint={{
                'line-color': '#f59e0b',
                'line-width': 2,
                'line-opacity': 1,
                'line-dasharray': [4, 4],
              }}
            />
          </Source>
        )}

        {/* Measurement points - draggable */}
        {measurementPoints.map((point, index) => (
          <Marker
            key={`measurement-point-${index}`}
            longitude={point.lng}
            latitude={point.lat}
            anchor="center"
            draggable={true}
            onDragEnd={(e) => {
              if (onMeasurementPointMove) {
                onMeasurementPointMove(index, e.lngLat.lng, e.lngLat.lat);
              }
            }}
          >
            <div className="relative group cursor-grab active:cursor-grabbing">
              {/* Glow */}
              <div className="absolute -inset-2 rounded-full bg-amber-400/30 group-hover:bg-amber-400/50 transition-all" />
              {/* Point */}
              <div className="relative w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-lg group-hover:scale-125 transition-transform" />
              {/* Index */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-[8px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                {index + 1}
              </div>
            </div>
          </Marker>
        ))}
      </>
    );
  };

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

        {/* Sectors */}
        {renderSectorsLayers()}

        {/* Confirmed/Drawn polygon */}
        {renderDrawnPolygon()}

        {/* Strip preview (snake route) */}
        {renderStripPreview()}

        {/* Drawing polygon (in progress) */}
        {renderDrawingPolygon()}

        {/* Measurement line */}
        {renderMeasurementLine()}

        {/* GPS marker */}
        {renderGpsMarker()}

        {/* Finding markers */}
        {renderFindingMarkers()}
      </>
    );
  };

  // --- MAP CLICK HANDLER ---
  const handleMapClick = (evt: any) => {
    // GA4: Track map click
    const map = leftMapRef.current?.getMap();
    if (map) {
      sendGAEvent('map_click', {
        lng: parseFloat(evt.lngLat.lng.toFixed(6)),
        lat: parseFloat(evt.lngLat.lat.toFixed(6)),
        zoom: parseFloat(map.getZoom().toFixed(2)),
        bearing: parseFloat(map.getBearing().toFixed(2)),
        pitch: parseFloat(map.getPitch().toFixed(2)),
      });
    }

    if (onMapClick) {
      onMapClick([evt.lngLat.lng, evt.lngLat.lat]);
    }
  };

  const handleMapDblClick = (evt: any) => {
    if (onMapDoubleClick) {
      evt.preventDefault();
      onMapDoubleClick();
    }
  };

  // Right-click to undo last point
  const handleContextMenu = (evt: any) => {
    if (isDrawingMode && onUndoLastPoint && drawingPolygon.length > 0) {
      evt.preventDefault();
      onUndoLastPoint();
    }
  };

  // Cursor style when drawing or measuring
  const drawingCursor = (isDrawingMode || isMeasuring) ? 'crosshair' : undefined;

  // --- RENDER MAPS ---
  const renderMap = (config: MapSideConfig, side: 'left' | 'right', ref: React.RefObject<MapRef>) => (
    <Map
      ref={ref}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      onClick={handleMapClick}
      onDblClick={handleMapDblClick}
      onContextMenu={handleContextMenu}
      doubleClickZoom={!onMapDoubleClick}
      mapStyle={getMapStyle(config.source) as any}
      terrain={{ source: `terrain-dem-${side}`, exaggeration }}
      style={{ ...getFilterStyle(side), cursor: drawingCursor }}
      cursor={drawingCursor}
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

      {/* Slider - Pointer Events pro jednotné ovládání mouse + touch */}
      <div
        ref={sliderRef}
        className="absolute z-[9999] select-none"
        style={{
          ...(isHorizontal
            ? { top: `${sliderPosition}%`, left: 0, right: 0, height: '60px', transform: 'translateY(-50%)', cursor: 'row-resize' }
            : { left: `${sliderPosition}%`, top: 0, bottom: 0, width: '60px', transform: 'translateX(-50%)', cursor: 'col-resize' }
          ),
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Slider line */}
        <div 
          className={`absolute bg-primary transition-all pointer-events-none ${
            isHorizontal 
              ? 'left-0 right-0 h-1 top-1/2 -translate-y-1/2' 
              : 'top-0 bottom-0 w-1 left-1/2 -translate-x-1/2'
          }`} 
        />
        
        {/* Handle s tlačítky +/- */}
        {/* Slider handle - center only */}
        <div 
          className={`absolute bg-surface border-2 border-primary rounded-full shadow-lg shadow-primary/20 flex items-center justify-center pointer-events-none ${
            isHorizontal 
              ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10' 
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10'
          }`}
        >
          <Move className={`text-primary ${isHorizontal ? 'w-5 h-5 rotate-90' : 'w-5 h-5'}`} />
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
