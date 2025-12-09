import { useMemo } from 'react';

interface ScaleBarProps {
  latitude: number;
  zoom: number;
  className?: string;
}

/**
 * Vypočítá měřítko mapy na základě zoom levelu a šířky
 * Vrací vzdálenost v metrech na 1 pixel
 */
function getMetersPerPixel(latitude: number, zoom: number): number {
  // Konstanty pro výpočet
  const EARTH_CIRCUMFERENCE = 40075016.686; // metry
  const TILE_SIZE = 256;
  
  // Meters per pixel at given latitude and zoom
  return (EARTH_CIRCUMFERENCE * Math.cos(latitude * Math.PI / 180)) / (TILE_SIZE * Math.pow(2, zoom));
}

/**
 * Najde "hezkou" vzdálenost pro měřítko (10, 20, 50, 100, 200, 500, 1000, ...)
 */
function getNiceDistance(meters: number): { distance: number; label: string } {
  const niceValues = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  
  // Najdi nejbližší "hezkou" hodnotu
  let best = niceValues[0];
  for (const val of niceValues) {
    if (val <= meters) {
      best = val;
    } else {
      break;
    }
  }
  
  // Formátuj label
  let label: string;
  if (best >= 1000) {
    label = `${best / 1000} km`;
  } else {
    label = `${best} m`;
  }
  
  return { distance: best, label };
}

export const ScaleBar = ({ latitude, zoom, className = '' }: ScaleBarProps) => {
  const { barWidth, label } = useMemo(() => {
    const metersPerPixel = getMetersPerPixel(latitude, zoom);
    
    // Chceme měřítko mezi 80-200 pixely
    const targetWidthPx = 120;
    const targetMeters = metersPerPixel * targetWidthPx;
    
    const { distance, label } = getNiceDistance(targetMeters);
    const barWidth = distance / metersPerPixel;
    
    return { barWidth, label };
  }, [latitude, zoom]);

  return (
    <div className={`flex flex-col items-end gap-0.5 ${className}`}>
      {/* Label */}
      <span className="text-[10px] font-mono text-white/70 tracking-wider pr-1">
        {label}
      </span>
      
      {/* Scale bar */}
      <div 
        className="h-1.5 bg-gradient-to-r from-white/80 to-white/60 rounded-full relative"
        style={{ width: `${Math.round(barWidth)}px` }}
      >
        {/* Tick marks */}
        <div className="absolute left-0 -top-1 w-0.5 h-3 bg-white/60 rounded-full" />
        <div className="absolute right-0 -top-1 w-0.5 h-3 bg-white/60 rounded-full" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-0.5 h-2 bg-white/40 rounded-full" />
      </div>
    </div>
  );
};



