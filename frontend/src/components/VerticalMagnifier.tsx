import { Mountain } from 'lucide-react';

interface VerticalMagnifierProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

export const VerticalMagnifier = ({ value, onChange, className }: VerticalMagnifierProps) => {
  return (
    <div className={`flex flex-col items-center gap-2 pointer-events-auto ${className || ''}`}>
      <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col items-center">
        <div className="text-[9px] font-mono text-white/50 font-bold mb-3 tracking-wider uppercase">Z-Scale</div>
        
        {/* Slider Container */}
        <div className="h-40 w-5 relative flex items-center justify-center bg-black/40 rounded-full border border-white/10">
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute -rotate-90 w-40 h-6 opacity-0 cursor-pointer z-20"
            title="Převýšení terénu (1x - 10x)"
          />
          
          {/* Visual Track */}
          <div className="w-1 h-full bg-white/10 rounded-full overflow-hidden relative">
             {/* Fill */}
             <div 
                className="absolute bottom-0 w-full bg-primary transition-all duration-100"
                style={{ height: `${((value - 1) / 9) * 100}%` }}
             />
          </div>
          
          {/* Thumb Indicator */}
          <div 
            className="absolute w-4 h-4 bg-surface border-2 border-primary rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-75 pointer-events-none z-10"
            style={{ bottom: `calc(${((value - 1) / 9) * 100}% - 8px)` }}
          />
        </div>

        <div className="mt-2 flex flex-col items-center gap-0.5">
            <Mountain className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-white">{value.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};


