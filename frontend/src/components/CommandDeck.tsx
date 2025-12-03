import { useState, useEffect } from 'react';
import { Columns3, Rows3, Maximize2, SlidersHorizontal, RotateCcw, Layers, Mountain, Navigation, Grid3X3 } from 'lucide-react';
import { clsx } from 'clsx';
import type { VisualFilters } from '../types/visualFilters';
import type { MapSideConfig } from '../types/mapSource';
import type { MapSetupConfig } from '../types/database';
import { MapSideSelector } from './MapSideSelector';
import { MapSetupsControl } from './MapSetupsControl';
import type { MapMode } from './AuthHeader';

// Přednastavené presety filtrů
const FILTER_PRESETS: Record<'A' | 'B' | 'C', VisualFilters> = {
  A: { invert: 0, contrast: 100, saturation: 120, brightness: 100, hue: 0, shadows: 100 },
  B: { invert: 15, contrast: 140, saturation: 90, brightness: 105, hue: -10, shadows: 120 },
  C: { invert: 0, contrast: 110, saturation: 100, brightness: 110, hue: 5, shadows: 90 }
};

interface CommandDeckProps {
  // Nový L/R systém
  leftMapConfig: MapSideConfig;
  rightMapConfig: MapSideConfig;
  onLeftMapConfigChange: (config: MapSideConfig) => void;
  onRightMapConfigChange: (config: MapSideConfig) => void;
  activeFilterSide: 'left' | 'right';
  onActiveFilterSideChange: (side: 'left' | 'right') => void;
  // Pohled
  splitMode: 'vertical' | 'horizontal' | 'none';
  setSplitMode: (mode: 'vertical' | 'horizontal' | 'none') => void;
  exaggeration: number;
  // Overlay vrstvy
  isKatastrActive: boolean;
  toggleKatastr: () => void;
  katastrOpacity: number;
  setKatastrOpacity: (opacity: number) => void;
  isVrstevniceActive: boolean;
  toggleVrstevnice: () => void;
  vrstevniceOpacity: number;
  setVrstevniceOpacity: (opacity: number) => void;
  // Filtry
  filtersOpen: boolean;
  toggleFilters: () => void;
  filters: VisualFilters;
  onFiltersChange: (key: keyof VisualFilters, value: number) => void;
  filtersEnabled: boolean;
  toggleFiltersEnabled: () => void;
  onResetFilters: () => void;
  // GPS
  isGpsActive: boolean;
  toggleGps: () => void;
  // Sektory
  isSectorsActive?: boolean;
  toggleSectors?: () => void;
  // Mode
  mode?: MapMode;
  // Map Setups
  onLoadSetup: (config: MapSetupConfig) => void;
}

export const CommandDeck = ({ 
  leftMapConfig,
  rightMapConfig,
  onLeftMapConfigChange,
  onRightMapConfigChange,
  activeFilterSide,
  onActiveFilterSideChange,
  splitMode, 
  setSplitMode, 
  exaggeration,
  isKatastrActive,
  toggleKatastr,
  katastrOpacity,
  setKatastrOpacity,
  isVrstevniceActive,
  toggleVrstevnice,
  vrstevniceOpacity,
  setVrstevniceOpacity,
  filtersOpen,
  toggleFilters,
  filters,
  onFiltersChange,
  filtersEnabled,
  toggleFiltersEnabled,
  onResetFilters,
  isGpsActive,
  toggleGps,
  isSectorsActive = false,
  toggleSectors,
  mode = 'map',
  onLoadSetup,
}: CommandDeckProps) => {
  // Aktuální konfigurace pro ukládání
  const currentConfig: MapSetupConfig = {
    leftMapConfig,
    rightMapConfig,
    splitMode,
    exaggeration,
    isKatastrActive,
    katastrOpacity,
    isVrstevniceActive,
    vrstevniceOpacity,
    visualFilters: filters,
    filtersEnabled,
  };
  const [activePreset, setActivePreset] = useState<'A' | 'B' | 'C'>('A');
  const [savedPresets, setSavedPresets] = useState<Record<'A' | 'B' | 'C', VisualFilters>>(FILTER_PRESETS);

  // Při změně presetu načíst hodnoty
  useEffect(() => {
    if (filtersEnabled) {
      const presetValues = savedPresets[activePreset];
      Object.entries(presetValues).forEach(([key, value]) => {
        onFiltersChange(key as keyof VisualFilters, value);
      });
    }
  }, [activePreset, filtersEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetChange = (preset: 'A' | 'B' | 'C') => {
    setActivePreset(preset);
    if (!filtersEnabled) {
      toggleFiltersEnabled();
    }
  };
  
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

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/50 relative overflow-visible">
        
        {/* Horní řádek: L/R výběr + Pohled + GPS */}
        <div className="flex items-center justify-center gap-4 px-4 py-3 border-b border-white/10">
          
          {/* L/R Selektor map */}
          <MapSideSelector
            leftConfig={leftMapConfig}
            rightConfig={rightMapConfig}
            onLeftChange={onLeftMapConfigChange}
            onRightChange={onRightMapConfigChange}
            activeFilterSide={activeFilterSide}
            onActiveFilterSideChange={onActiveFilterSideChange}
            splitMode={splitMode}
          />

          {/* Pohled - split mode */}
          <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1">
            <span className="text-[9px] uppercase tracking-wider text-white/40 px-2">Pohled</span>
            <button
              title="Vertikální"
              onClick={() => setSplitMode('vertical')}
              className={clsx(
                "p-1.5 rounded-lg transition-colors",
                splitMode === 'vertical' ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              title="Horizontální"
              onClick={() => setSplitMode('horizontal')}
              className={clsx(
                "p-1.5 rounded-lg transition-colors",
                splitMode === 'horizontal' ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <Rows3 className="w-4 h-4" />
            </button>
            <button
              title="Celá obrazovka (pouze L)"
              onClick={() => setSplitMode('none')}
              className={clsx(
                "p-1.5 rounded-lg transition-colors",
                splitMode === 'none' ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* GPS */}
          <button
            title="GPS poloha"
            onClick={toggleGps}
            className={clsx(
              "p-1.5 rounded-lg transition-colors bg-black/40",
              isGpsActive
                ? "text-sky-400"
                : "text-white/50 hover:text-white hover:bg-white/10"
            )}
          >
            <Navigation className="w-4 h-4" />
          </button>

          {/* Uložené pohledy */}
          <MapSetupsControl 
            currentConfig={currentConfig}
            onLoadSetup={onLoadSetup}
          />
        </div>

        {/* Dolní řádek: Filtry + Overlay vrstvy */}
        <div className="flex items-center justify-center gap-3 px-4 py-3">

          {/* Filtry */}
          <div className="relative group/mesh">
            <button
              title={`Filtry (aplikují se na ${activeFilterSide === 'left' ? 'L' : 'R'})`}
              onClick={toggleFilters}
              onContextMenu={(e) => { e.preventDefault(); onResetFilters(); }}
              className={clsx(
                "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                filtersOpen
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">FILTRY</span>
              <span className="text-[9px] px-1 rounded bg-black/30">{activeFilterSide === 'left' ? 'L' : 'R'}</span>
              <RotateCcw 
                className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity" 
                onClick={(e) => { e.stopPropagation(); onResetFilters(); }}
              />
            </button>

            {filtersOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-surface/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 pointer-events-auto space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">
                    Filtry ({activeFilterSide === 'left' ? 'Levá' : 'Pravá'})
                  </span>
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

          {/* Katastrální mapy */}
          <div className="relative group/katastr">
            <button
              title="Katastrální mapy"
              onClick={toggleKatastr}
              className={clsx(
                "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                isKatastrActive
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
              )}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden lg:block">KATASTR</span>
            </button>
            
            {isKatastrActive && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 group-hover/katastr:opacity-100 transition-opacity pointer-events-none group-hover/katastr:pointer-events-auto">
                <div className="w-44 p-3 bg-surface/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/50 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">Opacity</span>
                    <span className="text-blue-400 text-[10px] font-mono">{Math.round(katastrOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={katastrOpacity}
                    onChange={(e) => setKatastrOpacity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Vrstevnice */}
          <div className="relative group/vrstevnice">
            <button
              title="ZABAGED Vrstevnice"
              onClick={toggleVrstevnice}
              className={clsx(
                "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                isVrstevniceActive
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                  : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
              )}
            >
              <Mountain className="w-4 h-4" />
              <span className="hidden lg:block">VÝŠKOPIS</span>
            </button>
            
            {isVrstevniceActive && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 opacity-0 group-hover/vrstevnice:opacity-100 transition-opacity pointer-events-none group-hover/vrstevnice:pointer-events-auto">
                <div className="w-44 p-3 bg-surface/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/50 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">Opacity</span>
                    <span className="text-purple-400 text-[10px] font-mono">{Math.round(vrstevniceOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vrstevniceOpacity}
                    onChange={(e) => setVrstevniceOpacity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sektory - pouze v map modu */}
          {mode === 'map' && toggleSectors && (
            <button
              title="Zobrazit sektory"
              onClick={toggleSectors}
              className={clsx(
                "p-2 rounded-lg transition-colors border group flex items-center gap-2 font-mono text-xs",
                isSectorsActive
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 text-white/70 border-transparent hover:bg-white/10 hover:text-white"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden lg:block">SEKTORY</span>
            </button>
          )}
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
