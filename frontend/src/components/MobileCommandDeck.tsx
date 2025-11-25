import { useState } from 'react';
import { 
  ScanEye, Map, Layers, 
  X, SlidersHorizontal,
  Mountain, Compass, Columns3, Rows3, Maximize2
} from 'lucide-react';
import { clsx } from 'clsx';
import type { VisualFilters } from '../types/visualFilters';
import { MAP_STYLES, type MapStyleKey } from './SwipeMap';

interface MobileCommandDeckProps {
  activeMode: 'LIDAR' | 'OPTIC';
  setMode: (mode: 'LIDAR' | 'OPTIC') => void;
  splitMode: 'vertical' | 'horizontal' | 'none';
  setSplitMode: (mode: 'vertical' | 'horizontal' | 'none') => void;
  isOrtofotoActive: boolean;
  toggleOrtofoto: () => void;
  ortofotoOpacity: number;
  setOrtofotoOpacity: (opacity: number) => void;
  filtersEnabled: boolean;
  toggleFiltersEnabled: () => void;
  filters: VisualFilters;
  onFiltersChange: (key: keyof VisualFilters, value: number) => void;
  onResetFilters: () => void;
  mapStyleKey: MapStyleKey;
  setMapStyleKey: (key: MapStyleKey) => void;
  exaggeration: number;
  onExaggerationChange: (value: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  bearing: number;
  onResetNorth: () => void;
}

export const MobileCommandDeck = ({
  activeMode,
  setMode,
  splitMode,
  setSplitMode,
  isOrtofotoActive,
  toggleOrtofoto,
  ortofotoOpacity,
  setOrtofotoOpacity,
  filtersEnabled,
  toggleFiltersEnabled,
  filters,
  onFiltersChange,
  onResetFilters,
  mapStyleKey,
  setMapStyleKey,
  exaggeration,
  onExaggerationChange,
  pitch,
  onPitchChange,
  bearing: _bearing,
  onResetNorth
}: MobileCommandDeckProps) => {
  const [_isExpanded, setIsExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'layers' | 'filters' | '3d' | 'split'>('none');

  const closeAllPanels = () => {
    setActivePanel('none');
    setIsExpanded(false);
  };

  const togglePanel = (panel: 'layers' | 'filters' | '3d' | 'split') => {
    if (activePanel === panel) {
      setActivePanel('none');
    } else {
      setActivePanel(panel);
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Overlay when panel is open */}
      {activePanel !== 'none' && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeAllPanels}
        />
      )}

      {/* Main Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
        {/* Expanded Panel */}
        {activePanel !== 'none' && (
          <div 
            className="bg-surface/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <span className="text-white/70 font-mono text-sm uppercase tracking-wider">
                {activePanel === 'layers' && 'Vrstvy'}
                {activePanel === 'filters' && 'Filtry'}
                {activePanel === '3d' && '3D Nastavení'}
                {activePanel === 'split' && 'Rozdělení obrazovky'}
              </span>
              <button 
                onClick={closeAllPanels}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {activePanel === 'layers' && (
                <div className="space-y-4">
                  {/* Map Style Selection */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                      Základní mapa
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(MAP_STYLES).map(([key, value]) => {
                        const Icon = value.icon;
                        const isActive = key === mapStyleKey;
                        return (
                          <button
                            key={key}
                            onClick={() => setMapStyleKey(key as MapStyleKey)}
                            className={clsx(
                              'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                              isActive
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'bg-white/5 text-white/60 border border-transparent hover:bg-white/10'
                            )}
                          >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-mono">{value.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ortofoto Layer */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                        Ortofoto ČÚZK
                      </span>
                      <button
                        onClick={toggleOrtofoto}
                        className={clsx(
                          'w-12 h-7 rounded-full transition-all relative',
                          isOrtofotoActive ? 'bg-emerald-500' : 'bg-white/20'
                        )}
                      >
                        <div 
                          className={clsx(
                            'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md',
                            isOrtofotoActive ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                    {isOrtofotoActive && (
                      <MobileSlider
                        label="Průhlednost"
                        value={ortofotoOpacity * 100}
                        min={0}
                        max={100}
                        onChange={(v) => setOrtofotoOpacity(v / 100)}
                        suffix="%"
                      />
                    )}
                  </div>
                </div>
              )}

              {activePanel === 'filters' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                      Vizuální filtry
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onResetFilters}
                        className="px-3 py-1.5 text-[10px] font-mono text-white/50 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={toggleFiltersEnabled}
                        className={clsx(
                          'w-12 h-7 rounded-full transition-all relative',
                          filtersEnabled ? 'bg-primary' : 'bg-white/20'
                        )}
                      >
                        <div 
                          className={clsx(
                            'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md',
                            filtersEnabled ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className={clsx(!filtersEnabled && 'opacity-40 pointer-events-none')}>
                    <MobileSlider label="Invert" min={0} max={100} value={filters.invert} onChange={(v) => onFiltersChange('invert', v)} suffix="%" />
                    <MobileSlider label="Kontrast" min={50} max={200} value={filters.contrast} onChange={(v) => onFiltersChange('contrast', v)} suffix="%" />
                    <MobileSlider label="Saturace" min={50} max={200} value={filters.saturation} onChange={(v) => onFiltersChange('saturation', v)} suffix="%" />
                    <MobileSlider label="Jas" min={50} max={150} value={filters.brightness} onChange={(v) => onFiltersChange('brightness', v)} suffix="%" />
                    <MobileSlider label="Hue" min={-180} max={180} value={filters.hue} onChange={(v) => onFiltersChange('hue', v)} suffix="°" />
                    <MobileSlider label="Stíny" min={0} max={200} value={filters.shadows} onChange={(v) => onFiltersChange('shadows', v)} suffix="%" />
                  </div>
                </div>
              )}

              {activePanel === '3d' && (
                <div className="space-y-4">
                  <MobileSlider 
                    label="Výšková exagerace" 
                    min={0} 
                    max={300} 
                    value={exaggeration * 100} 
                    onChange={(v) => onExaggerationChange(v / 100)} 
                    suffix="×"
                    displayValue={exaggeration.toFixed(1)}
                  />
                  <MobileSlider 
                    label="Náklon" 
                    min={0} 
                    max={85} 
                    value={pitch} 
                    onChange={onPitchChange} 
                    suffix="°"
                  />
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={onResetNorth}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-colors"
                    >
                      <Compass className="w-5 h-5" />
                      <span className="font-mono text-sm">Resetovat na sever</span>
                    </button>
                  </div>
                </div>
              )}

              {activePanel === 'split' && (
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                    Režim zobrazení
                  </span>
                  
                  {/* Split Mode Options */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSplitMode('none')}
                      className={clsx(
                        'flex flex-col items-center gap-3 p-4 rounded-xl transition-all',
                        splitMode === 'none'
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-white/5 text-white/60 border border-transparent active:bg-white/10'
                      )}
                    >
                      <Maximize2 className="w-8 h-8" />
                      <span className="text-[11px] font-mono">Celá</span>
                    </button>
                    
                    <button
                      onClick={() => setSplitMode('horizontal')}
                      className={clsx(
                        'flex flex-col items-center gap-3 p-4 rounded-xl transition-all',
                        splitMode === 'horizontal'
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-white/5 text-white/60 border border-transparent active:bg-white/10'
                      )}
                    >
                      <Rows3 className="w-8 h-8" />
                      <span className="text-[11px] font-mono">Nahoře/Dole</span>
                    </button>
                    
                    <button
                      onClick={() => setSplitMode('vertical')}
                      className={clsx(
                        'flex flex-col items-center gap-3 p-4 rounded-xl transition-all',
                        splitMode === 'vertical'
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-white/5 text-white/60 border border-transparent active:bg-white/10'
                      )}
                    >
                      <Columns3 className="w-8 h-8" />
                      <span className="text-[11px] font-mono">Vlevo/Vpravo</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="bg-surface/95 backdrop-blur-xl border-t border-white/10 px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Mode Toggle - Left */}
            <div className="flex bg-black/40 rounded-xl p-1 gap-1">
              <button
                onClick={() => setMode('OPTIC')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all',
                  activeMode === 'OPTIC'
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/50'
                )}
              >
                <Map className="w-4 h-4" />
                <span className="text-[11px] font-mono">Optika</span>
              </button>
              <button
                onClick={() => setMode('LIDAR')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all',
                  activeMode === 'LIDAR'
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/50'
                )}
              >
                <ScanEye className="w-4 h-4" />
                <span className="text-[11px] font-mono">LiDAR</span>
              </button>
            </div>

            {/* Quick Actions - Right */}
            <div className="flex items-center gap-2">
              {/* Split Mode Toggle */}
              <button
                onClick={() => togglePanel('split')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all relative',
                  activePanel === 'split'
                    ? 'bg-violet-500/20 text-violet-400'
                    : splitMode !== 'none'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-white/10 text-white/60'
                )}
              >
                {splitMode === 'horizontal' ? (
                  <Rows3 className="w-5 h-5" />
                ) : splitMode === 'vertical' ? (
                  <Columns3 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => togglePanel('layers')}
                className={clsx(
                  'p-2.5 rounded-xl transition-all',
                  activePanel === 'layers'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/10 text-white/60'
                )}
              >
                <Layers className="w-5 h-5" />
              </button>

              {activeMode === 'LIDAR' && (
                <button
                  onClick={() => togglePanel('filters')}
                  className={clsx(
                    'p-2.5 rounded-xl transition-all',
                    activePanel === 'filters'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-white/10 text-white/60'
                  )}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              )}

              {activeMode === 'LIDAR' && (
                <button
                  onClick={() => togglePanel('3d')}
                  className={clsx(
                    'p-2.5 rounded-xl transition-all',
                    activePanel === '3d'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-white/10 text-white/60'
                  )}
                >
                  <Mountain className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </>
  );
};

// Mobile-optimized slider component
interface MobileSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
  displayValue?: string;
}

const MobileSlider = ({ label, value, min, max, onChange, suffix = '', displayValue }: MobileSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-xs font-mono">{label}</span>
        <span className="text-primary text-xs font-mono">
          {displayValue ?? Math.round(value)}{suffix}
        </span>
      </div>
      <div className="relative h-8 flex items-center">
        <div className="absolute inset-0 h-2 top-3 bg-black/40 rounded-full">
          <div 
            className="h-full bg-primary/60 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer touch-pan-x"
          style={{ WebkitAppearance: 'none', height: '32px' }}
        />
        <div 
          className="absolute w-6 h-6 bg-primary rounded-full shadow-lg shadow-primary/50 pointer-events-none transition-all border-2 border-white/20"
          style={{ left: `calc(${percentage}% - 12px)`, top: '4px' }}
        />
      </div>
    </div>
  );
};

