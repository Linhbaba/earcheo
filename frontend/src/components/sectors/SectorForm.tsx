import { useState, useMemo, useEffect, useRef } from 'react';
import { Check, X, MapPin, AlertCircle, Clock, Maximize2, RotateCcw, Edit3, Footprints } from 'lucide-react';
import type { GeoJSONPolygon, GeoJSONLineString } from '../../types/database';
import { 
  calculateArea, 
  formatArea, 
  coordsToPolygon, 
  calculatePolygonOrientation,
  generateStrips,
  createSnakeRoute,
  calculateTotalLength,
  formatLength,
} from '../../utils/geometry';

// --- GA4 TRACKING ---
const sendGA4Event = (eventName: string, params: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    if (import.meta.env.DEV) {
      console.log(`[GA4] ${eventName}`, JSON.stringify(params));
    }
  }
};

interface SectorFormProps {
  initialName?: string;
  initialDescription?: string;
  initialWalkingSpeed?: number;
  drawnPolygon: GeoJSONPolygon | null;
  drawingPolygon?: [number, number][]; // In-progress drawing
  stripWidth: number;
  onStripWidthChange: (width: number) => void;
  onSubmit: (name: string, description?: string, walkingSpeed?: number) => void;
  onCancel: () => void;
  onEditPolygon?: () => void; // Callback to edit polygon
  onStripsGenerated?: (strips: GeoJSONLineString[]) => void; // Live preview callback
  isEdit?: boolean;
}

// Default exploration speed based on walking pace with detector
// Typical walking speed while detecting: ~2.5 km/h = ~2500 m/h
const DEFAULT_WALKING_SPEED_KMH = 2.5;

const formatExplorationTime = (lengthMeters: number, speedKmh: number): string => {
  const speedMPerHour = speedKmh * 1000;
  const hoursNeeded = lengthMeters / speedMPerHour;
  
  if (hoursNeeded < 1/60) {
    return '< 1 min';
  } else if (hoursNeeded < 1) {
    const minutes = Math.round(hoursNeeded * 60);
    return `~${minutes} min`;
  } else if (hoursNeeded < 24) {
    const hours = Math.floor(hoursNeeded);
    const minutes = Math.round((hoursNeeded - hours) * 60);
    return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`;
  } else {
    const days = (hoursNeeded / 8).toFixed(1); // 8 hours per working day
    return `~${days} dní`;
  }
};

export const SectorForm = ({
  initialName = '',
  initialDescription = '',
  initialWalkingSpeed = DEFAULT_WALKING_SPEED_KMH,
  drawnPolygon,
  drawingPolygon = [],
  stripWidth,
  onStripWidthChange,
  onSubmit,
  onCancel,
  onEditPolygon,
  onStripsGenerated,
  isEdit = false,
}: SectorFormProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [walkingSpeed, setWalkingSpeed] = useState(initialWalkingSpeed);
  const stripWidthChangesRef = useRef(0);

  const hasPolygon = drawnPolygon !== null;
  const isDrawing = drawingPolygon.length > 0;
  
  // Calculate stats from either completed or in-progress polygon
  const stats = useMemo(() => {
    if (hasPolygon) {
      const area = calculateArea(drawnPolygon);
      return {
        area,
        formattedArea: formatArea(area),
        pointCount: drawnPolygon.coordinates[0].length - 1, // -1 because GeoJSON closes the ring
      };
    } else if (drawingPolygon.length >= 3) {
      const tempPolygon = coordsToPolygon(drawingPolygon);
      const area = calculateArea(tempPolygon);
      return {
        area,
        formattedArea: formatArea(area),
        pointCount: drawingPolygon.length,
      };
    }
    return {
      area: 0,
      formattedArea: '-',
      pointCount: drawingPolygon.length,
    };
  }, [hasPolygon, drawnPolygon, drawingPolygon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // GA4: Track form submission
    sendGA4Event('sector_form_submit', {
      is_edit: isEdit,
      has_polygon: hasPolygon,
      strip_width: stripWidth,
      walking_speed: walkingSpeed,
      strip_width_changes: stripWidthChangesRef.current,
      area_m2: stats.area > 0 ? Math.round(stats.area) : null,
    });
    
    onSubmit(name.trim(), description.trim() || undefined, walkingSpeed);
  };

  // Calculate orientation and strip info when polygon is confirmed
  const orientationInfo = useMemo(() => {
    if (!hasPolygon) return null;
    return calculatePolygonOrientation(drawnPolygon, stripWidth);
  }, [hasPolygon, drawnPolygon, stripWidth]);

  // Generate strip preview when polygon and width change
  const stripPreview = useMemo(() => {
    if (!hasPolygon) return null;
    
    const strips = generateStrips(drawnPolygon, stripWidth);
    const snakeRoute = createSnakeRoute(strips);
    const totalLength = calculateTotalLength(snakeRoute);
    
    return {
      strips: snakeRoute,
      count: snakeRoute.length,
      totalLength,
      formattedLength: formatLength(totalLength),
    };
  }, [hasPolygon, drawnPolygon, stripWidth]);

  // Exploration time based on route length (more accurate than area)
  const estimatedTime = useMemo(() => {
    if (stripPreview && stripPreview.totalLength > 0) {
      return formatExplorationTime(stripPreview.totalLength, walkingSpeed);
    }
    // Fallback: estimate from area (rough approximation)
    if (stats.area > 0) {
      // Assume ~3m strip width for rough estimate when no strips generated
      const estimatedLength = stats.area / 3;
      return formatExplorationTime(estimatedLength, walkingSpeed);
    }
    return '-';
  }, [stripPreview, stats.area, walkingSpeed]);

  // Notify parent about strip changes for map preview
  useEffect(() => {
    if (stripPreview && onStripsGenerated) {
      onStripsGenerated(stripPreview.strips);
    } else if (!stripPreview && onStripsGenerated) {
      onStripsGenerated([]);
    }
  }, [stripPreview, onStripsGenerated]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Polygon Status & Stats */}
        <div className={`rounded-xl overflow-hidden border ${hasPolygon ? 'border-emerald-500/30' : isDrawing ? 'border-amber-500/30' : 'border-white/10'}`}>
          {/* Status Header */}
          <div className={`px-4 py-3 ${hasPolygon ? 'bg-emerald-500/10' : isDrawing ? 'bg-amber-500/10' : 'bg-white/5'}`}>
            <div className="flex items-center gap-3">
              {hasPolygon ? (
                <MapPin className="w-5 h-5 text-emerald-400" />
              ) : isDrawing ? (
                <div className="relative">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                </div>
              ) : (
                <AlertCircle className="w-5 h-5 text-white/40" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-mono ${hasPolygon ? 'text-emerald-400' : isDrawing ? 'text-amber-400' : 'text-white/50'}`}>
                {isEdit ? 'Úprava sektoru' : hasPolygon ? 'Polygon hotov' : isDrawing ? `Kreslení... (${stats.pointCount} ${stats.pointCount === 1 ? 'bod' : stats.pointCount < 5 ? 'body' : 'bodů'})` : 'Nakreslete polygon'}
                </div>
              {!hasPolygon && !isDrawing && !isEdit && (
                  <div className="text-[10px] font-mono text-white/40 mt-0.5">
                    Klikáním na mapu přidejte body
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Display - Real-time during drawing */}
          {(hasPolygon || stats.area > 0) && (
            <div className="grid grid-cols-2 divide-x divide-white/10 bg-black/30">
              {/* Area */}
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Maximize2 className="w-3 h-3 text-amber-400/70" />
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Plocha</span>
                </div>
                <div className={`text-lg font-mono font-medium transition-all ${hasPolygon ? 'text-amber-400' : 'text-amber-400/70'}`}>
                  {stats.formattedArea}
                </div>
              </div>
              
              {/* Time */}
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-purple-400/70" />
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Průzkum</span>
                </div>
                <div className={`text-lg font-mono font-medium transition-all ${hasPolygon ? 'text-purple-400' : 'text-purple-400/70'}`}>
                  {estimatedTime}
                </div>
              </div>
            </div>
          )}
          
          {/* Strip Orientation Info - only when polygon confirmed */}
          {hasPolygon && orientationInfo && stripPreview && (
            <div className="bg-black/40 border-t border-white/5">
              {/* Orientation header */}
              <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400/70" />
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Orientace pásů</span>
                </div>
                <span className="text-sky-400 text-xs font-mono">
                  {Math.round(orientationInfo.angle)}°
                </span>
              </div>
              
              {/* Strip stats grid */}
              <div className="grid grid-cols-3 divide-x divide-white/5">
                <div className="p-2 text-center">
                  <div className="text-[8px] uppercase text-white/30 font-mono mb-0.5">Pásů</div>
                  <div className="text-sm font-mono text-sky-400 font-medium">{stripPreview.count}</div>
                </div>
                <div className="p-2 text-center">
                  <div className="text-[8px] uppercase text-white/30 font-mono mb-0.5">Délka</div>
                  <div className="text-sm font-mono text-emerald-400 font-medium">{stripPreview.formattedLength}</div>
                </div>
                <div className="p-2 text-center">
                  <div className="text-[8px] uppercase text-white/30 font-mono mb-0.5">Šířka</div>
                  <div className="text-sm font-mono text-amber-400 font-medium">{stripWidth}m</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Edit polygon button - only when polygon is confirmed and not in edit mode */}
          {hasPolygon && onEditPolygon && !isEdit && (
            <button
              type="button"
              onClick={() => {
                sendGA4Event('sector_polygon_edit', {
                  area_m2: Math.round(stats.area),
                  point_count: stats.pointCount,
                });
                onEditPolygon();
              }}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border-t border-white/5 flex items-center justify-center gap-2 text-white/50 hover:text-white text-xs font-mono transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Upravit polygon
            </button>
          )}
          
          {/* Instructions - only when not drawing yet and not in edit mode */}
          {!hasPolygon && !isDrawing && !isEdit && (
            <div className="px-4 py-3 bg-black/20 space-y-1.5">
              <div className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">klik</kbd>
                <span>přidat bod</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">mezerník</kbd>
                <span>posunout mapu</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-white/40">
                <Check className="w-3 h-3 text-emerald-400/60" />
                <span>potvrdit (min. 3 body)</span>
              </div>
            </div>
          )}
          
          {/* Minimum points hint */}
          {isDrawing && stats.pointCount < 3 && !isEdit && (
            <div className="px-4 py-2 bg-black/20 border-t border-white/5">
              <span className="text-[9px] font-mono text-amber-400/60">
                ⚠ Min. 3 body pro výpočet plochy
              </span>
            </div>
          )}
        </div>

      {/* Name Input */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-white/40 font-mono mb-2">
          Název sektoru *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="např. Pole u lesa"
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm font-mono placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
          required
        />
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-white/40 font-mono mb-2">
          Popis (volitelné)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Poznámky k sektoru..."
          rows={3}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm font-mono placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none"
        />
      </div>

      {/* Strip Width */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
            Šířka pásu
          </label>
          <span className="text-emerald-400 text-sm font-mono">{stripWidth.toFixed(1)} m</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          value={stripWidth}
          onChange={(e) => {
            stripWidthChangesRef.current++;
            onStripWidthChange(parseFloat(e.target.value));
          }}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
        <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1">
          <span>0.5m</span>
          <span>5m</span>
          <span>10m</span>
        </div>
      </div>

      {/* Walking Speed */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 font-mono">
            <Footprints className="w-3 h-3 text-purple-400/70" />
            Rychlost chůze
          </label>
          <span className="text-purple-400 text-sm font-mono">{walkingSpeed.toFixed(1)} km/h</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="15"
          step="0.1"
          value={walkingSpeed}
          onChange={(e) => setWalkingSpeed(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
        />
        <div className="flex justify-between text-[9px] font-mono text-white/30 mt-1">
          <span>0.1 km/h</span>
          <span>7.5 km/h</span>
          <span>15 km/h</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            sendGA4Event('sector_form_cancel', {
              is_edit: isEdit,
              had_polygon: hasPolygon,
              had_name: name.trim().length > 0,
            });
            onCancel();
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-mono text-sm transition-all"
        >
          <X className="w-4 h-4" />
          Zrušit
        </button>
        <button
          type="submit"
          disabled={!name.trim() || (!isEdit && !hasPolygon)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl text-white font-mono text-sm transition-all disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Uložit' : 'Vytvořit'}
        </button>
      </div>
    </form>
  );
};

