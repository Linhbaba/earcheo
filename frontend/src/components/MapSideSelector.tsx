import { useState, useRef, useEffect } from 'react';
import { Mountain, Image, Calendar, Globe, Moon, Map, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { MapSideConfig, MapSourceType } from '../types/mapSource';
import { MAP_SOURCE_META, MAP_SOURCE_CATEGORIES, ARCHIVE_YEARS } from '../types/mapSource';

const ICONS: Record<string, typeof Mountain> = {
  Mountain,
  Image,
  Calendar,
  Globe,
  Moon,
  Map,
};

// Custom SVG ikony pro L/R panel displeje
const PanelLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 3v18" strokeOpacity="0.3" />
    <rect x="4" y="4" width="7" height="16" rx="1" fill="currentColor" fillOpacity="0.2" stroke="none" />
  </svg>
);

const PanelRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 3v18" strokeOpacity="0.3" />
    <rect x="13" y="4" width="7" height="16" rx="1" fill="currentColor" fillOpacity="0.2" stroke="none" />
  </svg>
);

interface MapSideSelectorProps {
  leftConfig: MapSideConfig;
  rightConfig: MapSideConfig;
  onLeftChange: (config: MapSideConfig) => void;
  onRightChange: (config: MapSideConfig) => void;
  activeFilterSide: 'left' | 'right';
  onActiveFilterSideChange: (side: 'left' | 'right') => void;
  splitMode: 'vertical' | 'horizontal' | 'none';
}

export const MapSideSelector = ({
  leftConfig,
  rightConfig,
  onLeftChange,
  onRightChange,
  activeFilterSide,
  onActiveFilterSideChange,
  splitMode,
}: MapSideSelectorProps) => {
  const [openDropdown, setOpenDropdown] = useState<'left' | 'right' | null>(null);
  const [archiveSubmenu, setArchiveSubmenu] = useState<'left' | 'right' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zavřít dropdown při kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setArchiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSourceSelect = (side: 'left' | 'right', source: MapSourceType, archiveYear?: number) => {
    const config: MapSideConfig = {
      source,
      archiveYear: source === 'ARCHIVE' ? (archiveYear || 2022) : undefined,
    };
    
    if (side === 'left') {
      onLeftChange(config);
    } else {
      onRightChange(config);
    }
    
    if (source !== 'ARCHIVE' || archiveYear) {
      setOpenDropdown(null);
      setArchiveSubmenu(null);
    }
  };

  const getConfigLabel = (config: MapSideConfig): string => {
    if (config.source === 'ARCHIVE' && config.archiveYear) {
      return `Archiv '${String(config.archiveYear).slice(-2)}`; // Archiv '07, '21 etc.
    }
    return MAP_SOURCE_META[config.source].shortLabel;
  };
  
  // Speciální barvy pro archiv
  const getConfigColors = (config: MapSideConfig, isActive: boolean) => {
    if (config.source === 'ARCHIVE') {
      return isActive 
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-amber-900/30 text-amber-200/70 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-200";
    }
    return isActive
      ? "bg-primary/20 text-primary border-primary/40"
      : "bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white";
  };

  const getConfigIcon = (config: MapSideConfig) => {
    const iconName = MAP_SOURCE_META[config.source].icon;
    return ICONS[iconName] || Map;
  };

  const renderDropdown = (side: 'left' | 'right') => {
    const currentConfig = side === 'left' ? leftConfig : rightConfig;
    
    return (
      <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
        {Object.entries(MAP_SOURCE_CATEGORIES).map(([key, category]) => (
          <div key={key} className="border-b border-white/5 last:border-b-0">
            <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/40 font-mono bg-black/20">
              {category.label}
            </div>
            {category.sources.map((source) => {
              const meta = MAP_SOURCE_META[source];
              const Icon = ICONS[meta.icon] || Map;
              const isSelected = currentConfig.source === source;
              const isArchive = source === 'ARCHIVE';
              
              // Pro archiv - je vybrán pokud source matches A máme konkrétní rok
              const isArchiveSelected = isArchive && currentConfig.source === 'ARCHIVE' && currentConfig.archiveYear;
              
              return (
                <div key={source} className="relative">
                  <button
                    onClick={() => {
                      if (isArchive) {
                        setArchiveSubmenu(archiveSubmenu === side ? null : side);
                      } else {
                        handleSourceSelect(side, source);
                      }
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors",
                      // Zvýraznit i archiv když je vybrán
                      isSelected
                        ? isArchive
                          ? "bg-amber-500/20 text-amber-300" // Archiv má speciální barvu
                          : "bg-primary/20 text-primary"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{meta.label}</span>
                    {/* Archiv - zobrazit šipku nebo rok + check */}
                    {isArchive && (
                      <>
                        {isArchiveSelected && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                            {currentConfig.archiveYear}
                          </span>
                        )}
                        <ChevronRight className={clsx(
                          "w-3 h-3 transition-transform",
                          archiveSubmenu === side ? "rotate-90 text-amber-300" : "text-white/40"
                        )} />
                      </>
                    )}
                    {/* Check mark pro ne-archiv zdroje */}
                    {isSelected && !isArchive && <Check className="w-3 h-3" />}
                  </button>
                  
                  {/* Archiv submenu - inline pod tlačítkem */}
                  {isArchive && archiveSubmenu === side && (
                    <div className="bg-black/40 border-t border-amber-500/20">
                      <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider text-amber-400/60 font-mono">
                        Vyberte rok
                      </div>
                      <div className="grid grid-cols-5 gap-1 p-2 pt-0 max-h-48 overflow-y-auto">
                        {ARCHIVE_YEARS.map((year) => {
                          const isYearSelected = currentConfig.source === 'ARCHIVE' && currentConfig.archiveYear === year;
                          return (
                            <button
                              key={year}
                              onClick={() => handleSourceSelect(side, 'ARCHIVE', year)}
                              className={clsx(
                                "relative px-2 py-1.5 text-[10px] font-mono rounded transition-all",
                                isYearSelected
                                  ? "bg-amber-500/40 text-amber-200 border border-amber-400/60 shadow-lg shadow-amber-500/20"
                                  : "text-white/60 hover:bg-amber-500/20 hover:text-amber-200 border border-transparent"
                              )}
                            >
                              {year}
                              {isYearSelected && (
                                <Check className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 bg-surface rounded-full p-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const LeftIcon = getConfigIcon(leftConfig);
  const RightIcon = getConfigIcon(rightConfig);

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      {/* Levá mapa */}
      <div className="relative">
        <button
          onClick={() => {
            setOpenDropdown(openDropdown === 'left' ? null : 'left');
            setArchiveSubmenu(null);
            onActiveFilterSideChange('left');
          }}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-mono text-xs border whitespace-nowrap",
            getConfigColors(leftConfig, activeFilterSide === 'left')
          )}
        >
          <PanelLeftIcon className="w-5 h-5" />
          <LeftIcon className="w-3.5 h-3.5" />
          <span>{getConfigLabel(leftConfig)}</span>
        </button>
        {openDropdown === 'left' && renderDropdown('left')}
      </div>
      
      {/* Separator */}
      {splitMode !== 'none' && (
        <span className="text-white/20 text-xs">│</span>
      )}
      
      {/* Pravá mapa - skrytá v režimu celé obrazovky */}
      {splitMode !== 'none' && (
        <div className="relative">
          <button
            onClick={() => {
              setOpenDropdown(openDropdown === 'right' ? null : 'right');
              setArchiveSubmenu(null);
              onActiveFilterSideChange('right');
            }}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-mono text-xs border whitespace-nowrap",
              getConfigColors(rightConfig, activeFilterSide === 'right')
            )}
          >
            <PanelRightIcon className="w-5 h-5" />
            <RightIcon className="w-3.5 h-3.5" />
            <span>{getConfigLabel(rightConfig)}</span>
          </button>
          {openDropdown === 'right' && renderDropdown('right')}
        </div>
      )}
    </div>
  );
};

