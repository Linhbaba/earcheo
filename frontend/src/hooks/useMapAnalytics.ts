import { useCallback, useRef, useEffect } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import type { MapMouseEvent } from 'maplibre-gl';

// Typy GA4 eventů pro mapu
type MapEventName = 
  | 'map_click'
  | 'layer_click'
  | 'map_zoom_start'
  | 'map_zoom_end'
  | 'map_move'
  | 'layer_toggle';

interface MapClickParams {
  lng: number;
  lat: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface LayerClickParams {
  layer: string;
  feature_id?: string | number;
  name?: string;
  type?: string;
}

interface ZoomParams {
  zoom: number;
  lng: number;
  lat: number;
}

interface MoveParams {
  zoom: number;
  center_lng: number;
  center_lat: number;
}

interface LayerToggleParams {
  layer: string;
  state: 'on' | 'off';
}

type EventParams = MapClickParams | LayerClickParams | ZoomParams | MoveParams | LayerToggleParams;

/**
 * Odešle event do Google Analytics 4
 */
const sendGAEvent = (eventName: MapEventName, params: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params as unknown as Record<string, unknown>);
    
    // Debug log v development
    if (import.meta.env.DEV) {
      console.log(`[GA4] ${eventName}`, JSON.stringify(params));
    }
  }
};

/**
 * Hook pro trackování layer toggle eventů
 */
export const useLayerToggleTracking = () => {
  const trackLayerToggle = useCallback((layer: string, isActive: boolean) => {
    sendGAEvent('layer_toggle', {
      layer,
      state: isActive ? 'on' : 'off',
    });
  }, []);

  return { trackLayerToggle };
};

/**
 * Hook pro všechny mapové eventy
 * Připojí se k MapLibre instanci a automaticky trackuje interakce
 */
export const useMapAnalytics = (
  mapRef: React.RefObject<MapRef | null>,
  options?: {
    interactiveLayers?: string[];
    enableMoveTracking?: boolean;
    moveThrottleMs?: number;
  }
) => {
  const {
    interactiveLayers = [],
    enableMoveTracking = true,
    moveThrottleMs = 2000, // Max 1× za 2 sekundy
  } = options || {};

  // Refs pro throttling a state
  const lastMoveEventRef = useRef<number>(0);
  const isZoomingRef = useRef(false);
  const zoomStartDataRef = useRef<ZoomParams | null>(null);

  // Track map click
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    sendGAEvent('map_click', {
      lng: parseFloat(e.lngLat.lng.toFixed(6)),
      lat: parseFloat(e.lngLat.lat.toFixed(6)),
      zoom: parseFloat(map.getZoom().toFixed(2)),
      bearing: parseFloat(map.getBearing().toFixed(2)),
      pitch: parseFloat(map.getPitch().toFixed(2)),
    });
  }, [mapRef]);

  // Track layer click
  const handleLayerClick = useCallback((layerName: string, e: MapMouseEvent & { features?: Array<{ id?: string | number; properties?: Record<string, unknown> }> }) => {
    const feature = e.features?.[0];

    const params: LayerClickParams = {
      layer: layerName,
    };

    if (feature) {
      if (feature.id !== undefined) {
        params.feature_id = feature.id;
      }
      if (feature.properties) {
        if (feature.properties.name) {
          params.name = String(feature.properties.name).slice(0, 100);
        }
        if (feature.properties.type) {
          params.type = String(feature.properties.type).slice(0, 50);
        }
      }
    }

    sendGAEvent('layer_click', params);
  }, []);

  // Track zoom start
  const handleZoomStart = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || isZoomingRef.current) return;

    isZoomingRef.current = true;
    const center = map.getCenter();
    
    zoomStartDataRef.current = {
      zoom: parseFloat(map.getZoom().toFixed(2)),
      lng: parseFloat(center.lng.toFixed(6)),
      lat: parseFloat(center.lat.toFixed(6)),
    };

    sendGAEvent('map_zoom_start', zoomStartDataRef.current);
  }, [mapRef]);

  // Track zoom end
  const handleZoomEnd = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !isZoomingRef.current) return;

    isZoomingRef.current = false;
    const center = map.getCenter();

    sendGAEvent('map_zoom_end', {
      zoom: parseFloat(map.getZoom().toFixed(2)),
      lng: parseFloat(center.lng.toFixed(6)),
      lat: parseFloat(center.lat.toFixed(6)),
    });
  }, [mapRef]);

  // Track map move (throttled)
  const handleMove = useCallback(() => {
    if (!enableMoveTracking) return;

    const now = Date.now();
    if (now - lastMoveEventRef.current < moveThrottleMs) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    // Neposílat move event během zoomování
    if (isZoomingRef.current) return;

    lastMoveEventRef.current = now;
    const center = map.getCenter();

    sendGAEvent('map_move', {
      zoom: parseFloat(map.getZoom().toFixed(2)),
      center_lng: parseFloat(center.lng.toFixed(6)),
      center_lat: parseFloat(center.lat.toFixed(6)),
    });
  }, [mapRef, enableMoveTracking, moveThrottleMs]);

  // Připojení event listenerů k mapě
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Základní eventy
    map.on('click', handleMapClick);
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMove);

    // Layer click eventy pro interaktivní vrstvy
    interactiveLayers.forEach((layerName) => {
      const handler = (e: MapMouseEvent) => handleLayerClick(layerName, e);
      map.on('click', layerName, handler);
    });

    // Cleanup
    return () => {
      map.off('click', handleMapClick);
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMove);

      interactiveLayers.forEach(() => {
        // Note: Nemůžeme přímo odstranit handler, ale mapa se unmountne
      });
    };
  }, [mapRef.current, handleMapClick, handleZoomStart, handleZoomEnd, handleMove, handleLayerClick, interactiveLayers]);

  return {
    trackLayerClick: handleLayerClick,
  };
};

/**
 * Standalone funkce pro manuální tracking
 */
export const trackMapClick = (map: maplibregl.Map, lngLat: { lng: number; lat: number }) => {
  sendGAEvent('map_click', {
    lng: parseFloat(lngLat.lng.toFixed(6)),
    lat: parseFloat(lngLat.lat.toFixed(6)),
    zoom: parseFloat(map.getZoom().toFixed(2)),
    bearing: parseFloat(map.getBearing().toFixed(2)),
    pitch: parseFloat(map.getPitch().toFixed(2)),
  });
};

export const trackLayerToggle = (layer: string, isActive: boolean) => {
  sendGAEvent('layer_toggle', {
    layer,
    state: isActive ? 'on' : 'off',
  });
};

export default useMapAnalytics;
