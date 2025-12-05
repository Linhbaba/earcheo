import { useState } from 'react';
import { 
  Map, SlidersHorizontal, Navigation, Menu,
  X, Layers, Mountain, ChevronUp, ChevronDown,
  Rows3, Maximize2, User, Package, Lightbulb, LogOut, Search, Grid3X3, MapPin
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth0 } from '@auth0/auth0-react';
import type { VisualFilters } from '../types/visualFilters';
import type { MapSideConfig, MapSourceType } from '../types/mapSource';
import { MAP_SOURCE_META, ARCHIVE_YEARS } from '../types/mapSource';
import { MapSetupsControl } from './MapSetupsControl';
import type { MapSetupConfig } from '../types/database';
import type { MapMode } from './AuthHeader';

interface MobileBottomBarProps {
  // Map configs
  leftMapConfig: MapSideConfig;
  rightMapConfig: MapSideConfig;
  onLeftMapConfigChange: (config: MapSideConfig) => void;
  onRightMapConfigChange: (config: MapSideConfig) => void;
  // Split mode
  splitMode: 'vertical' | 'horizontal' | 'none';
  setSplitMode: (mode: 'vertical' | 'horizontal' | 'none') => void;
  // Overlays
  isKatastrActive: boolean;
  toggleKatastr: () => void;
  katastrOpacity: number;
  setKatastrOpacity: (v: number) => void;
  isVrstevniceActive: boolean;
  toggleVrstevnice: () => void;
  vrstevniceOpacity: number;
  setVrstevniceOpacity: (v: number) => void;
  // Place Names
  isPlaceNamesActive: boolean;
  togglePlaceNames: () => void;
  placeNamesOpacity: number;
  setPlaceNamesOpacity: (v: number) => void;
  // Filters
  filters: VisualFilters;
  onFiltersChange: (key: keyof VisualFilters, value: number) => void;
  filtersEnabled: boolean;
  toggleFiltersEnabled: () => void;
  onResetFilters: () => void;
  // GPS
  isGpsActive: boolean;
  toggleGps: () => void;
  onCenterGps: () => void;
  // Exaggeration for saved setups
  exaggeration: number;
  // Saved setups
  onLoadSetup: (config: MapSetupConfig) => void;
  // Sektory
  isSectorsActive?: boolean;
  toggleSectors?: () => void;
  // Mode
  mode?: MapMode;
  // Menu callbacks
  onOpenFindings: () => void;
  onOpenEquipment: () => void;
  onOpenFeatureRequests: () => void;
  onOpenProfile: () => void;
}

type PanelType = 'none' | 'maps' | 'filters' | 'menu';

const MAP_SOURCES: MapSourceType[] = ['LIDAR', 'ORTOFOTO', 'ARCHIVE', 'SATELLITE', 'DARK', 'CLASSIC'];

export const MobileBottomBar = ({
  leftMapConfig,
  rightMapConfig,
  onLeftMapConfigChange,
  onRightMapConfigChange,
  splitMode,
  setSplitMode,
  isKatastrActive,
  toggleKatastr,
  katastrOpacity,
  setKatastrOpacity,
  isVrstevniceActive,
  toggleVrstevnice,
  vrstevniceOpacity,
  setVrstevniceOpacity,
  isPlaceNamesActive,
  togglePlaceNames,
  placeNamesOpacity,
  setPlaceNamesOpacity,
  filters,
  onFiltersChange,
  filtersEnabled,
  toggleFiltersEnabled,
  onResetFilters,
  isGpsActive,
  toggleGps,
  onCenterGps,
  exaggeration,
  onLoadSetup,
  isSectorsActive = false,
  toggleSectors,
  mode = 'map',
  onOpenFindings,
  onOpenEquipment,
  onOpenFeatureRequests,
  onOpenProfile,
}: MobileBottomBarProps) => {
  const { logout } = useAuth0();
  const [activePanel, setActivePanel] = useState<PanelType>('none');
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');

  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? 'none' : panel);
  };

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

  const handleSourceSelect = (source: MapSourceType) => {
    const config: MapSideConfig = { source, archiveYear: source === 'ARCHIVE' ? 2020 : null };
    if (activeSide === 'left') {
      onLeftMapConfigChange(config);
    } else {
      onRightMapConfigChange(config);
    }
  };

  const handleYearChange = (year: number) => {
    const config: MapSideConfig = { source: 'ARCHIVE', archiveYear: year };
    if (activeSide === 'left') {
      onLeftMapConfigChange(config);
    } else {
      onRightMapConfigChange(config);
    }
  };

  const currentSideConfig = activeSide === 'left' ? leftMapConfig : rightMapConfig;

  return (
    <>
      {/* Overlay */}
      {activePanel !== 'none' && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setActivePanel('none')}
        />
      )}

      {/* Bottom Sheet Panel */}
      {activePanel !== 'none' && (
        <div 
          className="fixed bottom-20 left-2 right-2 z-50 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl max-h-[65vh] overflow-hidden animate-slide-up shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <span className="text-white/80 font-mono text-sm uppercase tracking-wider">
              {activePanel === 'maps' && 'Výběr map'}
              {activePanel === 'filters' && 'Filtry a vrstvy'}
              {activePanel === 'menu' && 'Menu'}
            </span>
            <button 
              onClick={() => setActivePanel('none')}
              className="p-2 rounded-full bg-white/10 active:bg-white/20"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
            
            {/* MAPS PANEL */}
            {activePanel === 'maps' && (
              <div className="space-y-5">
                {/* Split Mode */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                    Režim zobrazení
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSplitMode('none')}
                      className={clsx(
                        'flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                        splitMode === 'none'
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-white/5 text-white/60 border border-transparent active:bg-white/10'
                      )}
                    >
                      <Maximize2 className="w-6 h-6" />
                      <span className="text-[10px] font-mono">Celá</span>
                    </button>
                    <button
                      onClick={() => setSplitMode('horizontal')}
                      className={clsx(
                        'flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                        splitMode === 'horizontal'
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-white/5 text-white/60 border border-transparent active:bg-white/10'
                      )}
                    >
                      <Rows3 className="w-6 h-6" />
                      <span className="text-[10px] font-mono">Porovnat</span>
                    </button>
                  </div>
                </div>

                {/* Side Selector */}
                {splitMode !== 'none' && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                      Upravit stranu
                    </span>
                    <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveSide('left')}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all font-mono text-xs',
                          activeSide === 'left'
                            ? 'bg-primary/20 text-primary'
                            : 'text-white/50 active:bg-white/10'
                        )}
                      >
                        <ChevronUp className="w-4 h-4" />
                        Horní (L)
                      </button>
                      <button
                        onClick={() => setActiveSide('right')}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all font-mono text-xs',
                          activeSide === 'right'
                            ? 'bg-primary/20 text-primary'
                            : 'text-white/50 active:bg-white/10'
                        )}
                      >
                        <ChevronDown className="w-4 h-4" />
                        Dolní (R)
                      </button>
                    </div>
                  </div>
                )}

                {/* Map Source Selection */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                    {splitMode === 'none' ? 'Zdroj mapy' : `Zdroj mapy (${activeSide === 'left' ? 'Horní' : 'Dolní'})`}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {MAP_SOURCES.map((source) => {
                      const meta = MAP_SOURCE_META[source];
                      const isActive = currentSideConfig.source === source;
                      return (
                        <button
                          key={source}
                          onClick={() => handleSourceSelect(source)}
                          className={clsx(
                            'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all',
                            isActive
                              ? 'bg-primary/20 text-primary border border-primary/40'
                              : 'bg-white/5 text-white/60 border border-transparent active:bg-white/10'
                          )}
                        >
                          <span className="text-[10px] font-mono">{meta.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Archive Year Selector */}
                {currentSideConfig.source === 'ARCHIVE' && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                      Rok archivu: {currentSideConfig.archiveYear || 2020}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ARCHIVE_YEARS.filter(y => y >= 2007).map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={clsx(
                            'px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all',
                            currentSideConfig.archiveYear === year
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-white/5 text-white/50 active:bg-white/10'
                          )}
                        >
                          {year.toString().slice(-2)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FILTERS PANEL */}
            {activePanel === 'filters' && (
              <div className="space-y-5">
                {/* Overlay Layers */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-3 block">
                    Překryvné vrstvy
                  </span>
                  <div className="space-y-3">
                    {/* Katastr */}
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80 text-sm font-mono">Katastr</span>
                        </div>
                        <button
                          onClick={toggleKatastr}
                          className={clsx(
                            'w-12 h-7 rounded-full transition-all relative',
                            isKatastrActive ? 'bg-blue-500' : 'bg-white/20'
                          )}
                        >
                          <div className={clsx(
                            'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md',
                            isKatastrActive ? 'translate-x-6' : 'translate-x-1'
                          )} />
                        </button>
                      </div>
                      {isKatastrActive && (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={katastrOpacity}
                          onChange={(e) => setKatastrOpacity(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
                        />
                      )}
                    </div>

                    {/* Vrstevnice */}
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mountain className="w-4 h-4 text-purple-400" />
                          <span className="text-white/80 text-sm font-mono">Vrstevnice</span>
                        </div>
                        <button
                          onClick={toggleVrstevnice}
                          className={clsx(
                            'w-12 h-7 rounded-full transition-all relative',
                            isVrstevniceActive ? 'bg-purple-500' : 'bg-white/20'
                          )}
                        >
                          <div className={clsx(
                            'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md',
                            isVrstevniceActive ? 'translate-x-6' : 'translate-x-1'
                          )} />
                        </button>
                      </div>
                      {isVrstevniceActive && (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={vrstevniceOpacity}
                          onChange={(e) => setVrstevniceOpacity(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                        />
                      )}
                    </div>

                    {/* Názvy míst */}
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <span className="text-white/80 text-sm font-mono">Názvy míst</span>
                        </div>
                        <button
                          onClick={togglePlaceNames}
                          className={clsx(
                            'w-12 h-7 rounded-full transition-all relative',
                            isPlaceNamesActive ? 'bg-amber-500' : 'bg-white/20'
                          )}
                        >
                          <div className={clsx(
                            'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md',
                            isPlaceNamesActive ? 'translate-x-6' : 'translate-x-1'
                          )} />
                        </button>
                      </div>
                      {isPlaceNamesActive && (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={placeNamesOpacity}
                          onChange={(e) => setPlaceNamesOpacity(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                      )}
                    </div>

                    {/* Sektory - pouze v map modu */}
                    {mode === 'map' && toggleSectors && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4 text-emerald-400" />
                            <span className="text-white/80 text-sm font-mono">Sektory</span>
                          </div>
                          <button
                            onClick={toggleSectors}
                            className={clsx(
                              'w-12 h-7 rounded-full transition-all relative',
                              isSectorsActive ? 'bg-emerald-500' : 'bg-white/20'
                            )}
                          >
                            <div className={clsx(
                              'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md',
                              isSectorsActive ? 'translate-x-6' : 'translate-x-1'
                            )} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Filters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                      Vizuální filtry
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onResetFilters}
                        className="px-2 py-1 text-[10px] font-mono text-white/50 bg-white/10 rounded-lg active:bg-white/20"
                      >
                        Reset
                      </button>
                      <button
                        onClick={toggleFiltersEnabled}
                        className={clsx(
                          'w-10 h-6 rounded-full transition-all relative',
                          filtersEnabled ? 'bg-cyan-500' : 'bg-white/20'
                        )}
                      >
                        <div className={clsx(
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md',
                          filtersEnabled ? 'translate-x-5' : 'translate-x-1'
                        )} />
                      </button>
                    </div>
                  </div>
                  <div className={clsx('space-y-3', !filtersEnabled && 'opacity-40 pointer-events-none')}>
                    <MobileSlider label="Kontrast" min={50} max={200} value={filters.contrast} onChange={(v) => onFiltersChange('contrast', v)} />
                    <MobileSlider label="Jas" min={50} max={150} value={filters.brightness} onChange={(v) => onFiltersChange('brightness', v)} />
                    <MobileSlider label="Saturace" min={50} max={200} value={filters.saturation} onChange={(v) => onFiltersChange('saturation', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* MENU PANEL */}
            {activePanel === 'menu' && (
              <div className="space-y-1">
                <button
                  onClick={() => { setActivePanel('none'); onOpenProfile(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-white/80 active:bg-white/10 rounded-xl font-mono text-sm"
                >
                  <User className="w-5 h-5" />
                  Profil
                </button>
                <button
                  onClick={() => { setActivePanel('none'); onOpenFindings(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-white/80 active:bg-white/10 rounded-xl font-mono text-sm"
                >
                  <Search className="w-5 h-5" />
                  Nálezy
                </button>
                <button
                  onClick={() => { setActivePanel('none'); onOpenEquipment(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-white/80 active:bg-white/10 rounded-xl font-mono text-sm"
                >
                  <Package className="w-5 h-5" />
                  Vybavení
                </button>
                <button
                  onClick={() => { setActivePanel('none'); onOpenFeatureRequests(); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-white/80 active:bg-white/10 rounded-xl font-mono text-sm"
                >
                  <Lightbulb className="w-5 h-5" />
                  Navrhnout funkci
                </button>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 active:bg-red-500/10 rounded-xl font-mono text-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    Odhlásit se
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Maps */}
          <button
            onClick={() => togglePanel('maps')}
            className={clsx(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
              activePanel === 'maps' ? 'text-primary' : 'text-white/60 active:text-white'
            )}
          >
            <Map className="w-5 h-5" />
            <span className="text-[9px] font-mono">Mapy</span>
          </button>

          {/* Filters */}
          <button
            onClick={() => togglePanel('filters')}
            className={clsx(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
              activePanel === 'filters' ? 'text-cyan-400' : 'text-white/60 active:text-white'
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[9px] font-mono">Filtry</span>
          </button>

          {/* GPS */}
          <button
            onClick={onCenterGps}
            onDoubleClick={toggleGps}
            className={clsx(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
              isGpsActive ? 'text-sky-400' : 'text-white/60 active:text-white'
            )}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[9px] font-mono">GPS</span>
          </button>

          {/* Saved Setups */}
          <div className="flex flex-col items-center gap-1 px-4 py-2">
            <MapSetupsControl 
              currentConfig={currentConfig}
              onLoadSetup={onLoadSetup}
            />
            <span className="text-[9px] font-mono text-white/60">Uložit</span>
          </div>

          {/* Menu */}
          <button
            onClick={() => togglePanel('menu')}
            className={clsx(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
              activePanel === 'menu' ? 'text-primary' : 'text-white/60 active:text-white'
            )}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[9px] font-mono">Menu</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </>
  );
};

// Mobile Slider Component
const MobileSlider = ({ label, value, min, max, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/60 text-xs font-mono">{label}</span>
        <span className="text-cyan-400 text-xs font-mono">{Math.round(value)}%</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-black/40 rounded-full">
          <div 
            className="h-full bg-cyan-500/60 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

