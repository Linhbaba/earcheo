import React, { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import type { ViewState, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Move, Scan, Activity, Scroll, Globe, Moon, Map as MapIcon, MapPin } from 'lucide-react';
import type { VisualFilters } from '../types/visualFilters';
import type { UserLocation } from './LocationControl';
import type { Finding } from '../types/database';

// LOCAL PROXY URL - Connects to our Node.js backend which forwards to ČÚZK
// Using relative path '/api' which is proxied by Vite to localhost:3010
const PROXY_WMS_URL = '/api/wms-proxy?service=WMS&version=1.1.1&request=GetMap&layers=dmr5g:GrayscaleHillshade&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true';

// ČÚZK Ortofoto WMS - barevné letecké snímky České republiky
const ORTOFOTO_WMS_URL = '/api/ortofoto-proxy?service=WMS&version=1.1.1&request=GetMap&layers=GR_ORTFOTORGB&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=false';

// Free map styles
const STYLE_SATELLITE = {
    version: 8,
    sources: {
        'esri-satellite': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
        }
    },
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#000' }
        },
        {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            paint: { 'raster-opacity': 1 }
        }
    ]
};

const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const STYLE_STREET = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'; // Classic/Street style

export const MAP_STYLES = {
  SATELLITE: { label: 'Satelitní', style: STYLE_SATELLITE, icon: Globe },
  DARK: { label: 'Tmavá', style: STYLE_DARK, icon: Moon },
  STREET: { label: 'Klasická', style: STYLE_STREET, icon: MapIcon },
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

interface SwipeMapProps {
  mode?: 'LIDAR' | 'OPTIC';
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  splitMode?: 'vertical' | 'horizontal' | 'none';
  exaggeration?: number;
  isHistoryActive?: boolean;
  historyOpacity?: number;
  isOrtofotoActive?: boolean;
  ortofotoOpacity?: number;
  mapStyleKey: MapStyleKey;
  visualFilters: VisualFilters;
  filtersEnabled: boolean;
  userLocation?: UserLocation | null;
}

export const SwipeMap = ({ 
    mode = 'LIDAR', 
    viewState, 
    setViewState, 
    splitMode = 'vertical',
    exaggeration = 1.5,
    isHistoryActive = false,
    historyOpacity = 0.7,
    isOrtofotoActive = false,
    ortofotoOpacity = 0.8,
    mapStyleKey,
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

  // Initialize style based on mode, but only once or when mode changes if strictly needed.
  // User requested manual control, so we won't auto-switch aggressively, 
  // but we might want a sensible default if they haven't chosen one.
  // For now, we stick to SATELLITE as default and let user switch.



  // Handle drag (mouse)
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const axisSize = splitMode === 'horizontal' ? window.innerHeight : window.innerWidth;
    const coord = splitMode === 'horizontal' ? e.clientY : e.clientX;
    const percent = (coord / axisSize) * 100;
    setSliderPosition(Math.min(Math.max(percent, 0), 100));
  }, [isDragging, splitMode]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch drag (mobile)
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const axisSize = splitMode === 'horizontal' ? window.innerHeight : window.innerWidth;
    const coord = splitMode === 'horizontal' ? touch.clientY : touch.clientX;
    const percent = (coord / axisSize) * 100;
    setSliderPosition(Math.min(Math.max(percent, 0), 100));
  }, [isDragging, splitMode]);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      // Touch events
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);


  // --- RENDER LOGIC ---

  const renderLeftMap = () => (
        <Map
          ref={leftMapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={MAP_STYLES[mapStyleKey].style as any}
          // Enable terrain globally using free AWS/Mapzen data
          terrain={{ source: 'terrain-dem', exaggeration }}
        >
             <Source
              id="terrain-dem"
                type="raster-dem"
              tiles={['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']}
              encoding="terrarium"
              tileSize={256}
              maxzoom={15}
             />

           {/* GPS Marker */}
           {userLocation && (
             <Marker
               longitude={userLocation.lng}
               latitude={userLocation.lat}
               anchor="center"
             >
               <div className="relative pointer-events-none">
                 <div className="absolute w-8 h-8 bg-primary/30 rounded-full animate-ping" 
                      style={{ left: '-16px', top: '-16px' }} />
                 <div className="absolute w-6 h-6 bg-primary/50 rounded-full border-2 border-primary shadow-lg" 
                      style={{ left: '-12px', top: '-12px' }} />
                 <div className="absolute w-2 h-2 bg-white rounded-full" 
                      style={{ left: '-4px', top: '-4px' }} />
               </div>
             </Marker>
           )}

           {/* Finding Markers */}
           {findings.map((finding) => {
             const firstCategory = finding.category ? finding.category.split(',')[0].trim().toLowerCase() : '';
             const categoryColors: Record<string, string> = {
               'mince': '#ffae00',
               'coins': '#ffae00',
               'nástroje': '#9ca3af',
               'tools': '#9ca3af',
               'keramika': '#f97316',
               'pottery': '#f97316',
               'šperky': '#a855f7',
               'jewelry': '#a855f7',
               'zbraně': '#ef4444',
               'weapons': '#ef4444',
               'střelivo': '#dc2626',
               'militaria': '#ef4444',
             };
             const color = categoryColors[firstCategory] || '#00f3ff';
             const thumbnail = finding.images?.[0]?.thumbnailUrl;

             return (
               <Marker
                 key={finding.id}
                 longitude={finding.longitude}
                 latitude={finding.latitude}
                 anchor="bottom"
                 onClick={(e) => {
                   e.originalEvent.stopPropagation();
                   onFindingClick?.(finding);
                 }}
               >
                 <div className="relative group cursor-pointer pointer-events-auto">
                   {thumbnail ? (
                     /* Photo marker */
                     <div className="relative">
                       {/* Glow effect */}
                       <div 
                         className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                         style={{ 
                           backgroundColor: color,
                           width: '48px',
                           height: '48px',
                           left: '0',
                           top: '0'
                         }}
                       />
                       
                       <div 
                         className="relative w-12 h-12 rounded-full overflow-hidden border-3 shadow-lg group-hover:scale-110 transition-transform"
                         style={{ 
                           borderColor: color,
                           borderWidth: '3px'
                         }}
                       >
                         <img 
                           src={thumbnail} 
                           alt={finding.title}
                           className="w-full h-full object-cover"
                         />
                       </div>
                       {/* Small pin indicator at bottom */}
                       <div 
                         className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
                         style={{
                           borderLeft: '6px solid transparent',
                           borderRight: '6px solid transparent',
                           borderTop: `8px solid ${color}`
                         }}
                       />
                     </div>
                   ) : (
                     /* Pin icon fallback */
                     <div className="relative">
                       {/* Glow effect */}
                       <div 
                         className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                         style={{ 
                           backgroundColor: color,
                           width: '32px',
                           height: '32px',
                           left: '0',
                           top: '0'
                         }}
                       />
                       
                       <div
                         className="relative w-8 h-8 flex items-center justify-center"
                         style={{ color }}
                       >
                         <MapPin 
                           className="w-8 h-8 drop-shadow-lg group-hover:scale-125 transition-transform" 
                           fill={color}
                           strokeWidth={1.5}
                         />
                       </div>
                     </div>
                   )}
                   
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                     <div className="bg-surface/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 shadow-lg">
                       <p className="text-white font-mono text-xs font-semibold">{finding.title}</p>
                       <p className="text-white/60 font-mono text-xs">{finding.category}</p>
                     </div>
                   </div>
                 </div>
               </Marker>
             );
           })}

           <div className="absolute bottom-1 left-1 text-[10px] text-white/50 p-1 bg-black/20 backdrop-blur-sm rounded">
             {mapStyleKey === 'SATELLITE' ? 'ESRI World Imagery' : 'CartoDB'} | AWS Terrain
           </div>
        </Map>
  );

  const renderRightMap = (wrapperClassName = '', wrapperStyle: React.CSSProperties = {}) => {
    // Use free AWS terrain instead of Mapbox
    const terrainProps = { source: 'terrain-dem', exaggeration };
    // Proxy URL for Historical Map (II. vojenské mapování)
    const HISTORICAL_WMS = '/api/history-proxy?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=0';

    const finalWrapperStyle = { ...wrapperStyle };
    if (mode === 'LIDAR' && filtersEnabled) {
        // Shadows efekt: hodnoty < 100 zesvětlují stíny, > 100 ztmavují
        const shadowAdjust = visualFilters.shadows !== 100 
          ? `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="shadows"><feComponentTransfer><feFuncR type="gamma" exponent="${visualFilters.shadows / 100}"/><feFuncG type="gamma" exponent="${visualFilters.shadows / 100}"/><feFuncB type="gamma" exponent="${visualFilters.shadows / 100}"/></feComponentTransfer></filter></svg>#shadows') `
          : '';
        finalWrapperStyle.filter = `${shadowAdjust}invert(${visualFilters.invert}%) contrast(${visualFilters.contrast}%) saturate(${visualFilters.saturation}%) brightness(${visualFilters.brightness}%) hue-rotate(${visualFilters.hue}deg)`;
    }

      if (mode === 'LIDAR') {
          return (
            <div className={`absolute inset-0 ${wrapperClassName}`} style={finalWrapperStyle}> 
                <Map
                ref={rightMapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={MAP_STYLES[mapStyleKey].style as any} 
                terrain={terrainProps}
                >
                    <Source
                    id="terrain-dem"
                        type="raster-dem"
                    tiles={['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']}
                    encoding="terrarium"
                    tileSize={256}
                    maxzoom={15}
                    />
                <Source 
                    id="lidar-wms" 
                    type="raster" 
                    tiles={[PROXY_WMS_URL]} 
                    tileSize={256}
                >
                    <Layer 
                        id="lidar-layer" 
                        type="raster" 
                        paint={{ 'raster-opacity': 1, 'raster-contrast': 0.1 }}
                    />
                </Source>

                {isHistoryActive && (
                    <Source
                        id="history-wms"
                        type="raster"
                        tiles={[HISTORICAL_WMS]}
                        tileSize={256}
                    >
                        <Layer
                            id="history-layer"
                            type="raster"
                            paint={{ 'raster-opacity': historyOpacity, 'raster-saturation': -0.5 }}
                        />
                    </Source>
                )}

                {isOrtofotoActive && (
                    <Source
                        id="ortofoto-wms"
                        type="raster"
                        tiles={[ORTOFOTO_WMS_URL]}
                        tileSize={256}
                    >
                        <Layer
                            id="ortofoto-layer"
                            type="raster"
                            paint={{ 'raster-opacity': ortofotoOpacity }}
                        />
                    </Source>
                )}

                {/* GPS Marker */}
                {userLocation && (
                  <Marker
                    longitude={userLocation.lng}
                    latitude={userLocation.lat}
                    anchor="center"
                  >
                    <div className="relative pointer-events-none">
                      <div className="absolute w-8 h-8 bg-primary/30 rounded-full animate-ping" 
                           style={{ left: '-16px', top: '-16px' }} />
                      <div className="absolute w-6 h-6 bg-primary/50 rounded-full border-2 border-primary shadow-lg" 
                           style={{ left: '-12px', top: '-12px' }} />
                      <div className="absolute w-2 h-2 bg-white rounded-full" 
                           style={{ left: '-4px', top: '-4px' }} />
                    </div>
                  </Marker>
                )}

                {/* Finding Markers */}
                {findings.map((finding) => {
                  // Color based on first category (or default)
                  const firstCategory = finding.category ? finding.category.split(',')[0].trim().toLowerCase() : '';
                  const categoryColors: Record<string, string> = {
                    'mince': '#ffae00', // amber
                    'coins': '#ffae00',
                    'nástroje': '#9ca3af', // gray
                    'tools': '#9ca3af',
                    'keramika': '#f97316', // orange
                    'pottery': '#f97316',
                    'šperky': '#a855f7', // purple
                    'jewelry': '#a855f7',
                    'zbraně': '#ef4444', // red
                    'weapons': '#ef4444',
                    'střelivo': '#dc2626', // red dark
                    'militaria': '#ef4444',
                  };
                  const color = categoryColors[firstCategory] || '#00f3ff'; // default primary
                  const thumbnail = finding.images?.[0]?.thumbnailUrl;

                  return (
                    <Marker
                      key={finding.id}
                      longitude={finding.longitude}
                      latitude={finding.latitude}
                      anchor="bottom"
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        onFindingClick?.(finding);
                      }}
                    >
                      <div className="relative group cursor-pointer pointer-events-auto">
                        {thumbnail ? (
                          /* Photo marker */
                          <div className="relative">
                            {/* Glow effect */}
                            <div 
                              className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                              style={{ 
                                backgroundColor: color,
                                width: '48px',
                                height: '48px',
                                left: '0',
                                top: '0'
                              }}
                            />
                            
                            <div 
                              className="relative w-12 h-12 rounded-full overflow-hidden border-3 shadow-lg group-hover:scale-110 transition-transform"
                              style={{ 
                                borderColor: color,
                                borderWidth: '3px'
                              }}
                            >
                              <img 
                                src={thumbnail} 
                                alt={finding.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Small pin indicator at bottom */}
                            <div 
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
                              style={{
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: `8px solid ${color}`
                              }}
                            />
                          </div>
                        ) : (
                          /* Pin icon fallback */
                          <div className="relative">
                            {/* Glow effect */}
                            <div 
                              className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                              style={{ 
                                backgroundColor: color,
                                width: '32px',
                                height: '32px',
                                left: '0',
                                top: '0'
                              }}
                            />
                            
                            <div
                              className="relative w-8 h-8 flex items-center justify-center"
                              style={{ color }}
                            >
                              <MapPin 
                                className="w-8 h-8 drop-shadow-lg group-hover:scale-125 transition-transform" 
                                fill={color}
                                strokeWidth={1.5}
                              />
                            </div>
                          </div>
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <div className="bg-surface/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 shadow-lg">
                            <p className="text-white font-mono text-xs font-semibold">{finding.title}</p>
                            <p className="text-white/60 font-mono text-xs">{finding.category}</p>
                          </div>
                        </div>
                      </div>
                    </Marker>
                  );
                })}

                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
                </Map>
                
                {/* MESH OVERLAY (Grid of Dots) */}
                <div className="absolute top-4 right-4 text-primary text-xs font-bold flex flex-col items-end gap-1 z-50 pointer-events-none">
                    <div className="bg-black/50 px-2 py-1 rounded backdrop-blur flex items-center gap-2">
                        <Scan className="w-4 h-4" />
                        LIDAR: ONLINE (ČÚZK)
                    </div>
                    {isHistoryActive && (
                        <div className="bg-amber-900/50 text-amber-200 px-2 py-1 rounded backdrop-blur flex items-center gap-2">
                            <Scroll className="w-4 h-4" />
                            HISTORICAL MAP (1840)
                        </div>
                    )}
                    {isOrtofotoActive && (
                        <div className="bg-emerald-900/50 text-emerald-200 px-2 py-1 rounded backdrop-blur flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            ORTOFOTO ČÚZK
                        </div>
                    )}
                </div>
            </div>
          );
      } else if (mode === 'OPTIC') {
          return (
            <div className={`absolute inset-0 ${wrapperClassName}`} style={wrapperStyle}>
                <Map
                  ref={rightMapRef}
                  {...viewState}
                  onMove={evt => setViewState(evt.viewState)}
                  mapStyle={MAP_STYLES[mapStyleKey].style as any}
                  terrain={terrainProps}
                >
                  <Source
                      id="terrain-dem"
                      type="raster-dem"
                      tiles={['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']}
                      encoding="terrarium"
                      tileSize={256}
                      maxzoom={15}
                  />

                  {/* GPS Marker */}
                  {userLocation && (
                    <Marker
                      longitude={userLocation.lng}
                      latitude={userLocation.lat}
                      anchor="center"
                    >
                      <div className="relative pointer-events-none">
                        <div className="absolute w-8 h-8 bg-primary/30 rounded-full animate-ping" 
                             style={{ left: '-16px', top: '-16px' }} />
                        <div className="absolute w-6 h-6 bg-primary/50 rounded-full border-2 border-primary shadow-lg" 
                             style={{ left: '-12px', top: '-12px' }} />
                        <div className="absolute w-2 h-2 bg-white rounded-full" 
                             style={{ left: '-4px', top: '-4px' }} />
                      </div>
                    </Marker>
                  )}

                  {/* Finding Markers */}
                  {findings.map((finding) => {
                    const firstCategory = finding.category ? finding.category.split(',')[0].trim().toLowerCase() : '';
                    const categoryColors: Record<string, string> = {
                      'mince': '#ffae00',
                      'coins': '#ffae00',
                      'nástroje': '#9ca3af',
                      'tools': '#9ca3af',
                      'keramika': '#f97316',
                      'pottery': '#f97316',
                      'šperky': '#a855f7',
                      'jewelry': '#a855f7',
                      'zbraně': '#ef4444',
                      'weapons': '#ef4444',
                      'střelivo': '#dc2626',
                      'militaria': '#ef4444',
                    };
                    const color = categoryColors[firstCategory] || '#00f3ff';
                    const thumbnail = finding.images?.[0]?.thumbnailUrl;

                    return (
                      <Marker
                        key={finding.id}
                        longitude={finding.longitude}
                        latitude={finding.latitude}
                        anchor="bottom"
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          onFindingClick?.(finding);
                        }}
                      >
                        <div className="relative group cursor-pointer pointer-events-auto">
                          <div 
                            className="absolute rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                            style={{ 
                              backgroundColor: color,
                              width: thumbnail ? '48px' : '32px',
                              height: thumbnail ? '48px' : '32px',
                              left: thumbnail ? '-24px' : '-16px',
                              top: thumbnail ? '-48px' : '-32px'
                            }}
                          />
                          
                          {thumbnail ? (
                            <div className="relative">
                              <div 
                                className="w-12 h-12 rounded-full overflow-hidden border-3 shadow-lg group-hover:scale-110 transition-transform"
                                style={{ 
                                  borderColor: color,
                                  borderWidth: '3px'
                                }}
                              >
                                <img 
                                  src={thumbnail} 
                                  alt={finding.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div 
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
                                style={{
                                  borderLeft: '6px solid transparent',
                                  borderRight: '6px solid transparent',
                                  borderTop: `8px solid ${color}`
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="relative w-8 h-8 flex items-center justify-center"
                              style={{ color }}
                            >
                              <MapPin 
                                className="w-8 h-8 drop-shadow-lg group-hover:scale-125 transition-transform" 
                                fill={color}
                                strokeWidth={1.5}
                              />
                            </div>
                          )}
                          
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="bg-surface/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 shadow-lg">
                              <p className="text-white font-mono text-xs font-semibold">{finding.title}</p>
                              <p className="text-white/60 font-mono text-xs">{finding.category}</p>
                            </div>
                          </div>
                        </div>
                      </Marker>
                    );
                  })}

                  <div className="absolute top-4 right-4 text-xs font-bold flex items-center gap-2 z-50 bg-black/50 px-2 py-1 rounded backdrop-blur text-white/80">
                      <span className="text-primary">OPTIC MODE</span>
                      <Activity className="w-4 h-4 text-primary" />
                  </div>
                </Map>
            </div>
          );
      }
      return null;
  };

  if (splitMode === 'none') {
    return (
      <div className="absolute inset-0 w-full h-full font-mono">
        {renderRightMap("pointer-events-auto")}
      </div>
    );
  }

  // Pro vertikální: satelit vlevo, LiDAR vpravo
  // Pro horizontální: LiDAR nahoře, satelit dole (pro mobil praktičtější)
  const clipStyle =
    splitMode === 'horizontal'
      ? { clipPath: `inset(0 0 ${100 - sliderPosition}% 0)` }  // LiDAR nahoře, ořez zespodu
      : { clipPath: `inset(0 0 0 ${sliderPosition}%)` };       // LiDAR vpravo, ořez zleva

  const sliderStyle =
    splitMode === 'horizontal'
      ? { top: `${sliderPosition}%` }
      : { left: `${sliderPosition}%` };

  return (
    <div className="absolute inset-0 w-full h-full font-mono">
      {/* Základní vrstva */}
      <div className="absolute inset-0">
        {splitMode === 'horizontal' ? renderLeftMap() : renderLeftMap()}
      </div>
      {/* Překryvná vrstva s ořezem */}
      <div 
        className="absolute inset-0 pointer-events-auto overflow-hidden"
        style={clipStyle}
      >
        {renderRightMap()}
      </div>
      <div 
        className={
          splitMode === 'horizontal'
            ? "absolute left-0 right-0 h-[2px] bg-primary cursor-ns-resize z-40 flex items-center justify-center group shadow-[0_0_20px_rgba(0,243,255,0.5)] touch-none"
            : "absolute top-0 bottom-0 w-[2px] bg-primary cursor-ew-resize z-40 flex items-center justify-center group shadow-[0_0_20px_rgba(0,243,255,0.5)] touch-none"
        }
        style={sliderStyle}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="w-10 h-10 bg-black/80 backdrop-blur border-2 border-primary rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 active:scale-110 transition-transform">
            <Move className="w-5 h-5 text-primary" />
        </div>
        {splitMode === 'horizontal' ? (
          <div className="absolute left-0 right-0 h-full bg-primary/40" />
        ) : (
          <div className="absolute top-0 bottom-0 w-full bg-primary/40" />
        )}
      </div>
    </div>
  );
};
