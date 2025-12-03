import { Edit2, Trash2, Download, Play, RotateCcw, Save } from 'lucide-react';
import { clsx } from 'clsx';
import type { Sector, Track, GeoJSONLineString } from '../../types/database';
import { 
  calculateArea, 
  formatArea, 
  calculateTotalLength, 
  formatLength 
} from '../../utils/geometry';

interface SectorDetailProps {
  sector: Sector;
  tracks: Track[];
  generatedStrips: GeoJSONLineString[];
  stripWidth: number;
  onStripWidthChange: (width: number) => void;
  onGenerateStrips: () => void;
  onSaveTracks: () => void;
  onResetTracks: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const TRACK_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Čeká' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Probíhá' },
  COMPLETED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Hotovo' },
  SKIPPED: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Přeskočeno' },
};

export const SectorDetail = ({
  sector,
  tracks,
  generatedStrips,
  stripWidth,
  onStripWidthChange,
  onGenerateStrips,
  onSaveTracks,
  onResetTracks,
  onEdit,
  onDelete,
  onExport,
}: SectorDetailProps) => {
  const area = calculateArea(sector.geometry);
  const totalLength = tracks.length > 0 
    ? calculateTotalLength(tracks.map(t => t.geometry as GeoJSONLineString))
    : generatedStrips.length > 0
      ? calculateTotalLength(generatedStrips)
      : 0;

  // Track statistics
  const completed = tracks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tracks.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = tracks.filter(t => t.status === 'PENDING').length;
  const skipped = tracks.filter(t => t.status === 'SKIPPED').length;
  const progress = tracks.length > 0 ? ((completed + skipped) / tracks.length) * 100 : 0;

  const hasGeneratedStrips = generatedStrips.length > 0;
  const hasSavedTracks = tracks.length > 0;

  return (
    <div className="space-y-4">
      {/* Description */}
      {sector.description && (
        <p className="text-white/60 text-sm font-mono leading-relaxed">
          {sector.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-emerald-400 text-lg font-display">{formatArea(area)}</div>
          <div className="text-white/40 text-[10px] font-mono uppercase">Plocha</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-emerald-400 text-lg font-display">
            {hasSavedTracks ? tracks.length : hasGeneratedStrips ? generatedStrips.length : '-'}
          </div>
          <div className="text-white/40 text-[10px] font-mono uppercase">Pásů</div>
        </div>
        {totalLength > 0 && (
          <div className="bg-white/5 rounded-xl p-3 col-span-2">
            <div className="text-emerald-400 text-lg font-display">{formatLength(totalLength)}</div>
            <div className="text-white/40 text-[10px] font-mono uppercase">Celková délka tras</div>
          </div>
        )}
      </div>

      {/* Progress (only if has saved tracks) */}
      {hasSavedTracks && (
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm font-mono">Pokrok</span>
            <span className="text-emerald-400 text-sm font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries({ PENDING: pending, IN_PROGRESS: inProgress, COMPLETED: completed, SKIPPED: skipped }).map(([status, count]) => (
              <div key={status} className={clsx('rounded-lg p-2 text-center', TRACK_STATUS_COLORS[status].bg)}>
                <div className={clsx('text-sm font-mono', TRACK_STATUS_COLORS[status].text)}>{count}</div>
                <div className="text-[8px] font-mono text-white/40">{TRACK_STATUS_COLORS[status].label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strip Width Control */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-mono">Šířka pásu</span>
          <span className="text-emerald-400 text-sm font-mono">{stripWidth} m</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={stripWidth}
          onChange={(e) => onStripWidthChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Generate / Save buttons */}
        {!hasSavedTracks && (
          <>
            <button
              onClick={onGenerateStrips}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-emerald-400 font-mono text-sm transition-all"
            >
              <Play className="w-4 h-4" />
              {hasGeneratedStrips ? 'Přegenerovat pásy' : 'Vygenerovat pásy'}
            </button>
            
            {hasGeneratedStrips && (
              <button
                onClick={onSaveTracks}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-mono text-sm transition-all"
              >
                <Save className="w-4 h-4" />
                Uložit pásy ({generatedStrips.length})
              </button>
            )}
          </>
        )}

        {/* Reset tracks button */}
        {hasSavedTracks && (
          <button
            onClick={onResetTracks}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-mono text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Resetovat pásy
          </button>
        )}

        {/* Secondary actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-mono text-xs transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Upravit
          </button>
          <button
            onClick={onExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white font-mono text-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

