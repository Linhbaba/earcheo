import { X, Trash2, Ruler } from 'lucide-react';
import * as turf from '@turf/turf';

export interface MeasurementPoint {
  lng: number;
  lat: number;
}

interface MeasurementToolProps {
  points: MeasurementPoint[];
  isActive: boolean;
  onClear: () => void;
  onClose: () => void;
}

/**
 * Vypočítá vzdálenost mezi body v metrech pomocí Haversine
 */
function calculateDistance(points: MeasurementPoint[]): number {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const from = turf.point([points[i].lng, points[i].lat]);
    const to = turf.point([points[i + 1].lng, points[i + 1].lat]);
    total += turf.distance(from, to, { units: 'meters' });
  }
  return total;
}

/**
 * Formátuje vzdálenost pro zobrazení
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export const MeasurementTool = ({ 
  points, 
  isActive, 
  onClear, 
  onClose 
}: MeasurementToolProps) => {
  if (!isActive && points.length === 0) return null;

  const totalDistance = calculateDistance(points);
  const needsMorePoints = points.length < 2;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 bg-surface/95 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 shadow-xl shadow-black/30">
        {/* Icon */}
        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Ruler className="w-4 h-4 text-amber-400" />
        </div>

        {/* Distance or hint */}
        {needsMorePoints ? (
          <span className="text-white/50 text-xs font-mono whitespace-nowrap">
            přidejte min. 2 body
          </span>
        ) : (
          <span className="text-amber-400 font-mono font-bold text-sm whitespace-nowrap">
            {formatDistance(totalDistance)}
          </span>
        )}

        {/* Points count badge */}
        {points.length > 0 && (
          <span className="text-[10px] text-white/40 font-mono bg-white/5 px-1.5 py-0.5 rounded">
            {points.length}
          </span>
        )}

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={points.length === 0}
          className="p-1.5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
          title="Vymazat"
        >
          <Trash2 className="w-3.5 h-3.5 text-white/50" />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          title="Zavřít"
        >
          <X className="w-3.5 h-3.5 text-white/50" />
        </button>
      </div>
    </div>
  );
};

