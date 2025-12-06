import { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { Crosshair } from 'lucide-react';
import type { GeoJSONPolygon } from '../../types/database';

interface SectorMiniMapProps {
  geometry: GeoJSONPolygon;
  onFocus: () => void;
}

export const SectorMiniMap = ({ geometry, onFocus }: SectorMiniMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Calculate bounds from polygon
  const bounds = useMemo(() => {
    const coords = geometry.coordinates[0];
    if (!coords || coords.length < 3) return null;

    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    return new maplibregl.LngLatBounds(
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    );
  }, [geometry]);

  useEffect(() => {
    if (!mapContainer.current || !bounds) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      bounds: bounds,
      fitBoundsOptions: { padding: 30 },
      interactive: false, // Disable all interactions
      attributionControl: false,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add polygon source
      map.current.addSource('sector-polygon', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: geometry,
        },
      });

      // Add fill layer
      map.current.addLayer({
        id: 'sector-fill',
        type: 'fill',
        source: 'sector-polygon',
        paint: {
          'fill-color': '#34d399',
          'fill-opacity': 0.2,
        },
      });

      // Add outline layer
      map.current.addLayer({
        id: 'sector-outline',
        type: 'line',
        source: 'sector-polygon',
        paint: {
          'line-color': '#34d399',
          'line-width': 2,
        },
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [bounds, geometry]);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
      {/* Mini Map */}
      <div 
        ref={mapContainer} 
        className="w-full h-32"
        style={{ minHeight: '128px' }}
      />
      
      {/* Focus Button */}
      <button
        onClick={onFocus}
        className="w-full px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border-t border-white/10 flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs font-mono transition-colors"
      >
        <Crosshair className="w-4 h-4" />
        Zaměřit na sektor
      </button>
    </div>
  );
};

