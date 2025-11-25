import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { MAP_STYLES, type MapStyleKey } from './SwipeMap';

interface MapStyleSelectorProps {
  activeKey: MapStyleKey;
  onSelect: (key: MapStyleKey) => void;
}

export function MapStyleSelector({ activeKey, onSelect }: MapStyleSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="pointer-events-auto w-48 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 flex flex-col gap-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <span>LAYERS</span>
        <ChevronDown className={clsx(
          "w-3.5 h-3.5 text-primary transition-transform",
          isExpanded ? "" : "-rotate-90"
        )} />
      </button>
      {isExpanded && (
      <div className="flex flex-col gap-1.5 bg-black/40 p-1 rounded-xl">
        {Object.entries(MAP_STYLES).map(([key, value]) => {
          const Icon = value.icon;
          const isActive = key === activeKey;
          return (
            <button
              key={key}
              onClick={() => onSelect(key as MapStyleKey)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all font-mono text-xs',
                isActive
                  ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,243,255,0.3)] border border-primary/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{value.label}</span>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}


