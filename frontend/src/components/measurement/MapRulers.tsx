import { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';

interface Guideline {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number; // percentage 0-100
}

interface MapRulersProps {
  isActive: boolean;
  onClose: () => void;
}

export const MapRulers = ({ isActive, onClose }: MapRulersProps) => {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  const addGuideline = useCallback((type: 'horizontal' | 'vertical') => {
    const id = `${type}-${Date.now()}`;
    setGuidelines(prev => [...prev, { id, type, position: 50 }]);
  }, []);

  const removeGuideline = useCallback((id: string) => {
    setGuidelines(prev => prev.filter(g => g.id !== id));
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDragging(id);
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    
    const guideline = guidelines.find(g => g.id === dragging);
    if (!guideline) return;

    const rect = e.currentTarget.getBoundingClientRect();
    
    let newPosition: number;
    if (guideline.type === 'horizontal') {
      newPosition = ((e.clientY - rect.top) / rect.height) * 100;
    } else {
      newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    }
    
    newPosition = Math.max(0, Math.min(100, newPosition));
    
    setGuidelines(prev => prev.map(g => 
      g.id === dragging ? { ...g, position: newPosition } : g
    ));
  }, [dragging, guidelines]);

  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, []);

  if (!isActive) return null;

  return (
    <>
      {/* Ruler controls */}
      <div className="absolute top-24 right-6 z-50 pointer-events-auto">
        <div className="bg-surface/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-cyan-500/10 border-b border-cyan-500/20">
            <span className="font-mono text-xs text-white/90">VODÍTKA</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
          
          {/* Add buttons */}
          <div className="p-2 space-y-1.5">
            <button
              onClick={() => addGuideline('horizontal')}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 text-xs font-mono transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Horizontální</span>
              <div className="ml-auto w-6 h-0.5 bg-cyan-400 rounded-full" />
            </button>
            <button
              onClick={() => addGuideline('vertical')}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 text-xs font-mono transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vertikální</span>
              <div className="ml-auto w-0.5 h-4 bg-cyan-400 rounded-full" />
            </button>
          </div>

          {/* Guidelines list */}
          {guidelines.length > 0 && (
            <div className="px-2 pb-2 space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-white/40 px-1 pt-1">
                Aktivní ({guidelines.length})
              </div>
              {guidelines.map(g => (
                <div 
                  key={g.id}
                  className="flex items-center justify-between px-2 py-1.5 bg-black/20 rounded-lg text-[10px]"
                >
                  <span className="text-white/60 font-mono">
                    {g.type === 'horizontal' ? '—' : '|'} {Math.round(g.position)}%
                  </span>
                  <button
                    onClick={() => removeGuideline(g.id)}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hint */}
          <div className="px-3 py-2 bg-cyan-500/5 border-t border-cyan-500/10 text-[9px] text-white/40 font-mono">
            Táhni vodítko pro přesun
          </div>
        </div>
      </div>

      {/* Guidelines overlay */}
      <div 
        className="absolute inset-0 z-40 pointer-events-none"
        onMouseMove={dragging ? handleDragMove : undefined}
        onMouseUp={dragging ? handleDragEnd : undefined}
        onMouseLeave={dragging ? handleDragEnd : undefined}
        style={{ pointerEvents: dragging ? 'auto' : 'none' }}
      >
        {guidelines.map(g => (
          <div
            key={g.id}
            className={`absolute ${g.type === 'horizontal' 
              ? 'left-0 right-0 h-0.5 cursor-ns-resize' 
              : 'top-0 bottom-0 w-0.5 cursor-ew-resize'
            } pointer-events-auto group`}
            style={g.type === 'horizontal' 
              ? { top: `${g.position}%` }
              : { left: `${g.position}%` }
            }
            onMouseDown={() => handleDragStart(g.id)}
          >
            {/* Visible line */}
            <div className={`absolute ${g.type === 'horizontal'
              ? 'inset-x-0 h-px top-0'
              : 'inset-y-0 w-px left-0'
            } bg-cyan-400/70 group-hover:bg-cyan-400`} />
            
            {/* Larger hit area */}
            <div className={`absolute ${g.type === 'horizontal'
              ? 'inset-x-0 h-3 -top-1.5'
              : 'inset-y-0 w-3 -left-1.5'
            }`} />
            
            {/* Position label */}
            <div className={`absolute ${g.type === 'horizontal'
              ? 'left-2 -top-5'
              : 'top-2 -left-1 rotate-90 origin-left'
            } bg-cyan-500/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
              {Math.round(g.position)}%
            </div>
          </div>
        ))}
      </div>
    </>
  );
};


