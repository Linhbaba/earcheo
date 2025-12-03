import { Plus, Grid3X3, Loader } from 'lucide-react';
import type { Sector } from '../../types/database';
import { calculateArea, formatArea } from '../../utils/geometry';

interface SectorListProps {
  sectors: Sector[];
  loading: boolean;
  onSelect: (sector: Sector) => void;
  onNewSector: () => void;
}

export const SectorList = ({ sectors, loading, onSelect, onNewSector }: SectorListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* New Sector Button */}
      <button
        onClick={onNewSector}
        className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="text-left">
          <div className="text-white font-mono text-sm">Nový sektor</div>
          <div className="text-emerald-400/70 text-[10px] font-mono">Nakreslit na mapě</div>
        </div>
      </button>

      {/* Sectors List */}
      {sectors.length === 0 ? (
        <div className="text-center py-8">
          <Grid3X3 className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm font-mono">Zatím nemáte žádné sektory</p>
          <p className="text-white/30 text-xs font-mono mt-1">
            Klikněte na "Nový sektor" a nakreslete oblast
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sectors.map((sector) => {
            const area = calculateArea(sector.geometry);
            const trackCount = sector.tracks?.length || 0;
            const completedCount = sector.tracks?.filter(t => t.status === 'COMPLETED').length || 0;
            const progress = trackCount > 0 ? (completedCount / trackCount) * 100 : 0;

            return (
              <button
                key={sector.id}
                onClick={() => onSelect(sector)}
                className="w-full flex items-start gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Grid3X3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-mono text-sm truncate group-hover:text-emerald-300 transition-colors">
                    {sector.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-[10px] font-mono">
                      {formatArea(area)}
                    </span>
                    {trackCount > 0 && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="text-white/40 text-[10px] font-mono">
                          {completedCount}/{trackCount} pásů
                        </span>
                      </>
                    )}
                  </div>
                  {trackCount > 0 && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

