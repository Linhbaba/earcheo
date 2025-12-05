import { useMemo } from 'react';
import type { GeoJSONPolygon } from '../../types/database';

interface SectorMiniMapProps {
  geometry: GeoJSONPolygon;
  className?: string;
}

/**
 * SVG mini preview of sector polygon shape
 */
export const SectorMiniMap = ({ geometry, className = '' }: SectorMiniMapProps) => {
  const { pathD, viewBox } = useMemo(() => {
    const coords = geometry.coordinates[0];
    if (coords.length < 3) return { pathD: '', viewBox: '0 0 100 100' };

    // Find bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    coords.forEach(([lng, lat]) => {
      minX = Math.min(minX, lng);
      maxX = Math.max(maxX, lng);
      minY = Math.min(minY, lat);
      maxY = Math.max(maxY, lat);
    });

    // Add padding
    const padding = 0.1;
    const width = maxX - minX || 0.001;
    const height = maxY - minY || 0.001;
    const paddedMinX = minX - width * padding;
    const paddedMinY = minY - height * padding;
    const paddedWidth = width * (1 + 2 * padding);
    const paddedHeight = height * (1 + 2 * padding);

    // Create SVG path (flip Y because SVG Y is inverted)
    const points = coords.map(([lng, lat]) => {
      const x = ((lng - paddedMinX) / paddedWidth) * 100;
      const y = (1 - (lat - paddedMinY) / paddedHeight) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const pathD = `M ${points.join(' L ')} Z`;
    
    return { pathD, viewBox: '0 0 100 100' };
  }, [geometry]);

  return (
    <div className={`relative bg-black/40 rounded-xl overflow-hidden ${className}`}>
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="mini-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/30" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mini-grid)" />
      </svg>
      
      {/* Sector polygon */}
      <svg viewBox={viewBox} className="relative w-full h-full">
        {/* Glow effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Fill */}
        <path 
          d={pathD} 
          fill="rgba(16, 185, 129, 0.2)"
          stroke="rgba(16, 185, 129, 0.8)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />
        
        {/* Vertices */}
        {geometry.coordinates[0].slice(0, -1).map((coord, i) => {
          const coords = geometry.coordinates[0];
          const minX = Math.min(...coords.map(c => c[0]));
          const maxX = Math.max(...coords.map(c => c[0]));
          const minY = Math.min(...coords.map(c => c[1]));
          const maxY = Math.max(...coords.map(c => c[1]));
          const width = maxX - minX || 0.001;
          const height = maxY - minY || 0.001;
          const padding = 0.1;
          const paddedMinX = minX - width * padding;
          const paddedMinY = minY - height * padding;
          const paddedWidth = width * (1 + 2 * padding);
          const paddedHeight = height * (1 + 2 * padding);
          
          const x = ((coord[0] - paddedMinX) / paddedWidth) * 100;
          const y = (1 - (coord[1] - paddedMinY) / paddedHeight) * 100;
          
          return (
            <circle 
              key={i}
              cx={x} 
              cy={y} 
              r="2.5"
              fill="rgba(16, 185, 129, 1)"
              stroke="white"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      
      {/* Compass indicator */}
      <div className="absolute top-2 right-2 text-[8px] font-mono text-white/40">
        N ↑
      </div>
    </div>
  );
};
