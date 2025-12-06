import { useMemo } from 'react';
import type { GeoJSONPolygon } from '../../types/database';

interface PolygonPreviewProps {
  geometry: GeoJSONPolygon;
  size?: number;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
}

export const PolygonPreview = ({
  geometry,
  size = 40,
  className = '',
  strokeColor = '#34d399', // emerald-400
  fillColor = 'rgba(52, 211, 153, 0.2)',
}: PolygonPreviewProps) => {
  const svgPath = useMemo(() => {
    const coords = geometry.coordinates[0];
    if (!coords || coords.length < 3) return '';

    // Get bounding box
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const width = maxLng - minLng;
    const height = maxLat - minLat;
    
    // Add padding
    const padding = 4;
    const availableSize = size - padding * 2;
    
    // Scale to fit in size, maintaining aspect ratio
    const scale = Math.min(availableSize / width, availableSize / height);
    
    // Center offset
    const offsetX = (size - width * scale) / 2;
    const offsetY = (size - height * scale) / 2;

    // Convert to SVG coordinates (flip Y axis)
    const points = coords.map(([lng, lat]) => {
      const x = (lng - minLng) * scale + offsetX;
      const y = (maxLat - lat) * scale + offsetY; // Flip Y
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')} Z`;
  }, [geometry, size]);

  if (!svgPath) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      <path
        d={svgPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};

