import { MoveVertical } from 'lucide-react';

interface TiltControlProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

export const TiltControl = ({ value, onChange, className }: TiltControlProps) => {
  return (
    <div className={`flex flex-col items-center gap-2 pointer-events-auto ${className || ''}`}>
      <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col items-center">
        <div className="text-[9px] font-mono text-white/50 font-bold mb-3 tracking-wider uppercase">Náklon</div>
        
        {/* Slider Container */}
        <div className="h-40 w-5 relative flex items-center justify-center bg-black/40 rounded-full border border-white/10">
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute -rotate-90 w-40 h-6 opacity-0 cursor-pointer z-20"
            title="Náklon kamery (0° - 60°)"
          />
          
          {/* Visual Track */}
          <div className="w-1 h-full bg-white/10 rounded-full overflow-hidden relative">
             {/* Fill */}
             <div 
                className="absolute bottom-0 w-full bg-primary transition-all duration-100"
                style={{ height: `${(value / 60) * 100}%` }}
             />
          </div>
          
          {/* Thumb Indicator */}
          <div 
            className="absolute w-4 h-4 bg-surface border-2 border-primary rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-75 pointer-events-none z-10"
            style={{ bottom: `calc(${(value / 60) * 100}% - 8px)` }}
          />
        </div>

        <div className="mt-2 flex flex-col items-center gap-0.5">
            <MoveVertical className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-white">{value.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
};

