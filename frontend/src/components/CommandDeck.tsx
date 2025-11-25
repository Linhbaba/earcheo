import { useState, useEffect } from 'react';
import { ScanEye, Map, Columns3, Rows3, Maximize2, Scroll, SlidersHorizontal, RotateCcw, Image } from 'lucide-react';
import { clsx } from 'clsx';
import type { VisualFilters } from '../types/visualFilters';

// Přednastavené presety filtrů
const FILTER_PRESETS: Record<'A' | 'B' | 'C', VisualFilters> = {
  A: { invert: 0, contrast: 100, saturation: 120, brightness: 100, hue: 0, shadows: 100 },
  B: { invert: 15, contrast: 140, saturation: 90, brightness: 105, hue: -10, shadows: 120 },
  C: { invert: 0, contrast: 110, saturation: 100, brightness: 110, hue: 5, shadows: 90 }
};

interface CommandDeckProps {
  activeMode: 'LIDAR' | 'OPTIC';
  setMode: (mode: 'LIDAR' | 'OPTIC') => void;
  splitMode: 'vertical' | 'horizontal' | 'none';
  setSplitMode: (mode: 'vertical' | 'horizontal' | 'none') => void;
  splitModeLocked: boolean;
  isHistoryActive: boolean;
  toggleHistory: () => void;
  historyOpacity: number;
  setHistoryOpacity: (opacity: number) => void;
  isOrtofotoActive: boolean;
  toggleOrtofoto: () => void;
  ortofotoOpacity: number;
  setOrtofotoOpacity: (opacity: number) => void;
  filtersOpen: boolean;
  toggleFilters: () => void;
  filters: VisualFilters;
  onFiltersChange: (key: keyof VisualFilters, value: number) => void;
  filtersEnabled: boolean;
  toggleFiltersEnabled: () => void;
  onResetFilters: () => void;
}

export const CommandDeck = ({ 
  activeMode, 
  setMode, 
  splitMode, 
  setSplitMode, 
  splitModeLocked,
  isHistoryActive,
  toggleHistory,
  historyOpacity,
  setHistoryOpacity,
  isOrtofotoActive,
  toggleOrtofoto,
  ortofotoOpacity,
  setOrtofotoOpacity,
  filtersOpen,
  toggleFilters,
  filters,
  onFiltersChange,
  filtersEnabled,
  toggleFiltersEnabled,
  onResetFilters
}: CommandDeckProps) => {
  const [activePreset, setActivePreset] = useState<'A' | 'B' | 'C'>('A');
  // Uložené hodnoty pro každý preset
  const [savedPresets, setSavedPresets] = useState<Record<'A' | 'B' | 'C', VisualFilters>>({
    A: { ...FILTER_PRESETS.A },
    B: { ...FILTER_PRESETS.B },
    C: { ...FILTER_PRESETS.C }
  });
  const isHistoryToggleEnabled = false;
  
  // Aplikovat preset při změně aktivního presetu
  useEffect(() => {
    const presetValues = savedPresets[activePreset];
    Object.entries(presetValues).forEach(([key, value]) => {
      onFiltersChange(key as keyof VisualFilters, value);
    });
  }, [activePreset]);
  
  // Při změně presetu zapnout filtry, pokud ještě nejsou zapnuté
  const handlePresetChange = (preset: 'A' | 'B' | 'C') => {
    setActivePreset(preset);
    if (!filtersEnabled) {
      toggleFiltersEnabled();
    }
  };
  
  // Wrapper pro onChange, který ukládá hodnoty do aktivního presetu
  const handleFilterChange = (key: keyof VisualFilters, value: number) => {
    onFiltersChange(key, value);
    setSavedPresets(prev => ({
      ...prev,
      [activePreset]: {
        ...prev[activePreset],
        [key]: value
      }
    }));
  };
  
  const modes = [
    { id: 'OPTIC', label: 'Optika', icon: Map },
    { id: 'LIDAR', label: 'LiDAR', icon: ScanEye },
  ] as const;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 relative">
        <div className="flex justify-between items-center gap-4">
          
          {/* Mode Selector */}
          <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setMode(mode.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300",
                  activeMode === mode.id
                    ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,243,255,0.3)] border border-primary/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <mode.icon className="w-4 h-4" />
                {mode.label}
              </button>
            ))}
          </div>

          {/* Quick Tools */}
          <div className="h-8 w-[1px] bg-white/10 mx-2" />

          {/* Tool Buttons */}
          <div className="flex items-center gap-2">
              <div className="relative group/mesh">
                  <button
                      title="Filtry zobrazení"
                      onClick={toggleFilters}
                      className={clsx(
                          "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                          filtersOpen
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                              : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
                      )}
                  >
                      <SlidersHorizontal className="w-5 h-5" />
                      <span className="hidden sm:block">FILTRY</span>
                  <button
                      title="Reset filtrů"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetFilters();
                          }}
                          className="p-1 rounded transition-colors hover:bg-white/20 ml-1"
                  >
                          <RotateCcw className="w-3 h-3" />
                      </button>
                  </button>

                {filtersOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 pointer-events-auto space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">Úpravy</span>
                      <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg">
                        {(['A', 'B', 'C'] as const).map((preset) => (
                      <button
                            key={preset}
                            onClick={() => handlePresetChange(preset)}
                        className={clsx(
                          "px-2.5 py-0.5 rounded text-[10px] font-mono transition-all",
                              activePreset === preset && filtersEnabled
                            ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                      >
                            {preset}
                      </button>
                        ))}
                      </div>
                    </div>
                    <FilterSlider label="Invert" min={0} max={100} value={filters.invert} onChange={(v) => handleFilterChange('invert', v)} suffix="%" />
                    <FilterSlider label="Kontrast" min={50} max={200} value={filters.contrast} onChange={(v) => handleFilterChange('contrast', v)} suffix="%" />
                    <FilterSlider label="Saturace" min={50} max={200} value={filters.saturation} onChange={(v) => handleFilterChange('saturation', v)} suffix="%" />
                    <FilterSlider label="Jas" min={50} max={150} value={filters.brightness} onChange={(v) => handleFilterChange('brightness', v)} suffix="%" />
                    <FilterSlider label="Hue" min={-180} max={180} value={filters.hue} onChange={(v) => handleFilterChange('hue', v)} suffix="°" />
                    <FilterSlider label="Stíny" min={0} max={200} value={filters.shadows} onChange={(v) => handleFilterChange('shadows', v)} suffix="%" />
                  </div>
                )}
              </div>

              {isHistoryToggleEnabled && (
              <div className="relative group/history">
                  <button
                      title="Historical Map (1840)"
                      onClick={toggleHistory}
                      className={clsx(
                          "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                          isHistoryActive
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
                      )}
                  >
                      <Scroll className="w-5 h-5" />
                      <span className="hidden sm:block">1840</span>
                  </button>
                  
                  {/* Hover Slider for History Opacity */}
                  {isHistoryActive && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-3 bg-black/80 backdrop-blur border border-white/10 rounded-xl shadow-xl opacity-0 group-hover/history:opacity-100 transition-opacity pointer-events-none group-hover/history:pointer-events-auto">
                          <div className="text-[10px] text-white/50 mb-1 font-mono text-center">OPACITY: {Math.round(historyOpacity * 100)}%</div>
                          <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.1" 
                              value={historyOpacity} 
                              onChange={(e) => setHistoryOpacity(parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                      </div>
                  )}
              </div>
              )}

              {/* Ortofoto Toggle */}
              <div className="relative group/ortofoto">
                  <button
                      title="Ortofoto ČÚZK"
                      onClick={toggleOrtofoto}
                      className={clsx(
                          "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                          isOrtofotoActive
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
                      )}
                  >
                      <Image className="w-5 h-5" />
                      <span className="hidden sm:block">ORTOFOTO</span>
                  </button>
                  
                  {/* Hover Slider for Ortofoto Opacity - styled like FilterSlider */}
                  {isOrtofotoActive && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 group-hover/ortofoto:opacity-100 transition-opacity pointer-events-none group-hover/ortofoto:pointer-events-auto">
                          <div className="w-44 p-3 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/50 space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">Opacity</span>
                                  <span className="text-primary text-[10px] font-mono">{Math.round(ortofotoOpacity * 100)}%</span>
                              </div>
                              <div className="relative h-1 bg-black/40 rounded-full">
                                  <div 
                                      className="absolute h-full bg-primary transition-all rounded-full"
                                      style={{ width: `${ortofotoOpacity * 100}%` }}
                                  />
                                  <div 
                                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-surface shadow-[0_0_8px_rgba(0,243,255,0.5)] transition-all pointer-events-none"
                                      style={{ left: `calc(${ortofotoOpacity * 100}% - 6px)` }}
                                  />
                                  <input
                                      type="range"
                                      min="0"
                                      max="1"
                                      step="0.05"
                                      value={ortofotoOpacity}
                                      onChange={(e) => setOrtofotoOpacity(parseFloat(e.target.value))}
                                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                  />
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-2" />

          {/* View mode dropdown */}
          <div className="flex items-center gap-2 pointer-events-auto relative bg-black/40 rounded-xl p-1.5 border border-white/10">
             <span className="uppercase tracking-[0.15em] text-[10px] text-white/50 pl-1.5">Pohled</span>
             <div className="flex items-center gap-1">
               <button
                 title="Vertikální rozdělení"
                 onClick={() => setSplitMode('vertical')}
                 disabled={splitModeLocked}
                 className={clsx(
                   "p-1.5 rounded-md border transition-colors",
                   splitMode === 'vertical'
                     ? "bg-primary/20 border-primary/60 text-primary"
                     : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-primary",
                   splitModeLocked && "opacity-40 cursor-not-allowed pointer-events-none"
                 )}
               >
                 <Columns3 className="w-4 h-4" />
               </button>
               <button
                 title="Horizontální rozdělení"
                 onClick={() => setSplitMode('horizontal')}
                 disabled={splitModeLocked}
                 className={clsx(
                   "p-1.5 rounded-md border transition-colors",
                   splitMode === 'horizontal'
                     ? "bg-primary/20 border-primary/60 text-primary"
                     : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-primary",
                   splitModeLocked && "opacity-40 cursor-not-allowed pointer-events-none"
                 )}
               >
                 <Rows3 className="w-4 h-4" />
               </button>
               <button
                 title="Celá obrazovka"
                 onClick={() => setSplitMode('none')}
                 className={clsx(
                   "p-1.5 rounded-md border transition-colors",
                   splitMode === 'none'
                     ? "bg-primary/20 border-primary/60 text-primary"
                     : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-primary"
                 )}
               >
                 <Maximize2 className="w-4 h-4" />
               </button>
             </div>
             {splitModeLocked && (
               <span className="text-amber-300 text-[9px] font-mono pl-2 pr-1">
                 Optika = celá obrazovka
               </span>
             )}
          </div>

        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
    </div>
  );
};

interface FilterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}

const FilterSlider = ({ label, value, min, max, onChange, suffix = '' }: FilterSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-[9px] uppercase tracking-wider text-white/50 font-mono">
        <span>{label}</span>
        <span className="text-primary text-[10px]">{value}{suffix}</span>
      </span>
      <div className="relative h-1 bg-black/40 rounded-full">
        <div 
          className="absolute h-full bg-primary transition-all rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-surface shadow-[0_0_8px_rgba(0,243,255,0.5)] transition-all pointer-events-none"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </label>
  );
};
