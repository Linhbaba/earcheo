import { useMemo } from 'react';
import { Trash2, Download, MapPin, Clock, Maximize2, RotateCcw, Edit3 } from 'lucide-react';
import { clsx } from 'clsx';
import type { Sector, Track, GeoJSONLineString } from '../../types/database';
import { 
  calculateArea, 
  formatArea, 
  calculateTotalLength, 
  formatLength,
  calculatePolygonOrientation,
} from '../../utils/geometry';
import { SectorMiniMap } from './SectorMiniMap';

interface SectorDetailProps {
  sector: Sector;
  tracks: Track[];
  stripWidth: number;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onFocus?: () => void;
}

// Exploration speed based on walking pace with detector
const EXPLORATION_SPEED_M_PER_HOUR = 2500;

const formatExplorationTime = (lengthMeters: number): string => {
  const hoursNeeded = lengthMeters / EXPLORATION_SPEED_M_PER_HOUR;
  
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
    const days = (hoursNeeded / 8).toFixed(1);
    return `~${days} dní`;
  }
};

const TRACK_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Čeká' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Probíhá' },
  COMPLETED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Hotovo' },
  SKIPPED: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Přeskočeno' },
};

export const SectorDetail = ({
  sector,
  tracks,
  stripWidth,
  onEdit,
  onDelete,
  onExport,
  onFocus,
}: SectorDetailProps) => {
  const hasTracks = tracks.length > 0;

  // Calculate stats
  const stats = useMemo(() => {
  const area = calculateArea(sector.geometry);
    const totalLength = hasTracks 
    ? calculateTotalLength(tracks.map(t => t.geometry as GeoJSONLineString))
      : area / stripWidth; // Estimate if no tracks
    
    return {
      area,
      formattedArea: formatArea(area),
      totalLength,
      formattedLength: formatLength(totalLength),
      estimatedTime: formatExplorationTime(totalLength),
    };
  }, [sector.geometry, tracks, stripWidth, hasTracks]);

  // Calculate orientation
  const orientationInfo = useMemo(() => {
    return calculatePolygonOrientation(sector.geometry, stripWidth);
  }, [sector.geometry, stripWidth]);

  // Track statistics
  const trackStats = useMemo(() => {
    if (!hasTracks) return null;
    
  const completed = tracks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tracks.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = tracks.filter(t => t.status === 'PENDING').length;
  const skipped = tracks.filter(t => t.status === 'SKIPPED').length;
    const progress = ((completed + skipped) / tracks.length) * 100;

    return { completed, inProgress, pending, skipped, progress };
  }, [tracks, hasTracks]);

  return (
    <div className="space-y-4">
      {/* Mini Map with Focus Button */}
      {onFocus && (
        <SectorMiniMap 
          geometry={sector.geometry} 
          onFocus={onFocus}
        />
      )}

      {/* Main Stats Card */}
      <div className="rounded-xl overflow-hidden border border-emerald-500/30">
        {/* Status Header */}
        <div className="px-4 py-3 bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <div className="flex-1">
              <div className="text-sm font-mono text-emerald-400">
                {hasTracks ? `${tracks.length} pásů uloženo` : 'Sektor uložen'}
              </div>
              {sector.description && (
                <div className="text-[10px] font-mono text-white/40 mt-0.5 truncate">
                  {sector.description}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Display */}
        <div className="grid grid-cols-2 divide-x divide-white/10 bg-black/30">
          {/* Area */}
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Maximize2 className="w-3 h-3 text-amber-400/70" />
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Plocha</span>
            </div>
            <div className="text-lg font-mono font-medium text-amber-400">
              {stats.formattedArea}
            </div>
          </div>
          
          {/* Time */}
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-purple-400/70" />
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Průzkum</span>
            </div>
            <div className="text-lg font-mono font-medium text-purple-400">
              {stats.estimatedTime}
            </div>
          </div>
        </div>
        
        {/* Strip Orientation Info */}
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
              <div className="text-sm font-mono text-sky-400 font-medium">
                {hasTracks ? tracks.length : Math.ceil(stats.area / (stripWidth * 100))}
              </div>
            </div>
            <div className="p-2 text-center">
              <div className="text-[8px] uppercase text-white/30 font-mono mb-0.5">Délka</div>
              <div className="text-sm font-mono text-emerald-400 font-medium">{stats.formattedLength}</div>
            </div>
            <div className="p-2 text-center">
              <div className="text-[8px] uppercase text-white/30 font-mono mb-0.5">Šířka</div>
              <div className="text-sm font-mono text-amber-400 font-medium">{stripWidth}m</div>
            </div>
          </div>
        </div>

        {/* Edit actions */}
        <button
          onClick={onEdit}
          className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border-t border-white/5 flex items-center justify-center gap-2 text-white/50 hover:text-white text-xs font-mono transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Upravit info
        </button>
      </div>

      {/* Progress Card - Only if has tracks */}
      {trackStats && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
          <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-mono">Pokrok průzkumu</span>
              <span className="text-emerald-400 text-sm font-mono font-bold">{Math.round(trackStats.progress)}%</span>
          </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                style={{ width: `${trackStats.progress}%` }}
            />
            </div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-white/5">
            {Object.entries({ PENDING: trackStats.pending, IN_PROGRESS: trackStats.inProgress, COMPLETED: trackStats.completed, SKIPPED: trackStats.skipped }).map(([status, count]) => (
              <div key={status} className={clsx('p-2 text-center', TRACK_STATUS_COLORS[status].bg)}>
                <div className={clsx('text-sm font-mono font-medium', TRACK_STATUS_COLORS[status].text)}>{count}</div>
                <div className="text-[7px] font-mono text-white/40 uppercase">{TRACK_STATUS_COLORS[status].label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-mono text-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          Export GeoJSON
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          Smazat
          </button>
      </div>
    </div>
  );
};
