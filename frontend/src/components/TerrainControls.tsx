import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { VerticalMagnifier } from './VerticalMagnifier';
import { TiltControl } from './TiltControl';

interface TerrainControlsProps {
  exaggeration: number;
  onExaggerationChange: (value: number) => void;
  pitch: number;
  onPitchChange: (value: number) => void;
}

export const TerrainControls = ({ 
  exaggeration, 
  onExaggerationChange, 
  pitch, 
  onPitchChange 
}: TerrainControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="pointer-events-auto w-48 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 flex flex-col gap-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer w-full"
      >
        <span>3D</span>
        <ChevronDown className={clsx(
          "w-3.5 h-3.5 text-primary transition-transform",
          isExpanded ? "" : "-rotate-90"
        )} />
      </button>

      {isExpanded && (
        <div className="flex flex-row gap-2 justify-center pointer-events-none">
          <VerticalMagnifier 
            value={exaggeration} 
            onChange={onExaggerationChange} 
          />
          <TiltControl 
            value={pitch} 
            onChange={onPitchChange} 
          />
        </div>
      )}
    </div>
  );
};

