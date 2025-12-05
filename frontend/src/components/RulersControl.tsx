import { useState, useCallback, useRef } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';

interface Guideline {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

interface RulersControlProps {
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export const RulersControl = ({ isActive, onActiveChange }: RulersControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const addGuideline = useCallback((type: 'horizontal' | 'vertical') => {
    const id = `${type}-${Date.now()}`;
    setGuidelines(prev => [...prev, { id, type, position: 50 }]);
    if (!isActive) onActiveChange(true);
  }, [isActive, onActiveChange]);

  const removeGuideline = useCallback((id: string) => {
    setGuidelines(prev => {
      const newList = prev.filter(g => g.id !== id);
      if (newList.length === 0) onActiveChange(false);
      return newList;
    });
  }, [onActiveChange]);

  const updatePosition = useCallback((id: string, position: number) => {
    setGuidelines(prev => prev.map(g => 
      g.id === id ? { ...g, position: Math.max(0, Math.min(100, position)) } : g
    ));
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId || !overlayRef.current) return;
    
    const guideline = guidelines.find(g => g.id === draggingId);
    if (!guideline) return;

    const rect = overlayRef.current.getBoundingClientRect();
    let newPosition: number;
    
    if (guideline.type === 'horizontal') {
      newPosition = ((e.clientY - rect.top) / rect.height) * 100;
    } else {
      newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    }
    
    updatePosition(draggingId, newPosition);
  }, [draggingId, guidelines, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  return (
    <>
      {/* Control Panel */}
      <div className="pointer-events-auto w-48 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 flex flex-col gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer w-full"
        >
          <span>VODÍTKA</span>
          <ChevronDown className={clsx(
            "w-3.5 h-3.5 text-primary transition-transform",
            isExpanded ? "" : "-rotate-90"
          )} />
        </button>

        {isExpanded && (
          <div className="flex flex-col gap-2">
            {/* Add buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => addGuideline('horizontal')}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-[10px] font-mono transition-colors"
              >
                <Plus className="w-3 h-3" />
                <div className="w-4 h-0.5 bg-current rounded-full" />
              </button>
              <button
                onClick={() => addGuideline('vertical')}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-[10px] font-mono transition-colors"
              >
                <Plus className="w-3 h-3" />
                <div className="w-0.5 h-4 bg-current rounded-full" />
              </button>
            </div>

            {/* Guidelines list */}
            {guidelines.length > 0 && (
              <div className="space-y-1">
                {guidelines.map((g, index) => (
                  <div 
                    key={g.id}
                    className="flex items-center justify-between px-2 py-1 bg-black/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 text-xs">
                        {g.type === 'horizontal' ? '—' : '|'}
                      </span>
                      <span className="text-[10px] text-white/60 font-mono">
                        Vodítko {index + 1}
                      </span>
                    </div>
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
            {guidelines.length === 0 && (
              <div className="text-[9px] text-white/30 text-center">
                Táhni vodítko na mapě
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guidelines overlay - draggable */}
      {guidelines.length > 0 && (
        <div 
          ref={overlayRef}
          className="fixed inset-0 z-30"
          style={{ pointerEvents: draggingId ? 'auto' : 'none' }}
          onMouseMove={draggingId ? handleMouseMove : undefined}
          onMouseUp={draggingId ? handleMouseUp : undefined}
          onMouseLeave={draggingId ? handleMouseUp : undefined}
        >
          {guidelines.map(g => (
            <div
              key={g.id}
              className={`absolute group ${g.type === 'horizontal' 
                ? 'left-0 right-0 h-4 -translate-y-1/2 cursor-ns-resize' 
                : 'top-0 bottom-0 w-4 -translate-x-1/2 cursor-ew-resize'
              }`}
              style={g.type === 'horizontal' 
                ? { top: `${g.position}%`, pointerEvents: 'auto' }
                : { left: `${g.position}%`, pointerEvents: 'auto' }
              }
              onMouseDown={(e) => handleMouseDown(g.id, e)}
            >
              {/* Visible line */}
              <div 
                className={`absolute ${g.type === 'horizontal'
                  ? 'left-0 right-0 top-1/2 h-px -translate-y-1/2'
                  : 'top-0 bottom-0 left-1/2 w-px -translate-x-1/2'
                } bg-cyan-400/70 group-hover:bg-cyan-400 transition-colors ${
                  draggingId === g.id ? 'bg-cyan-300' : ''
                }`}
              />
              
              {/* Position label on hover */}
              <div 
                className={`absolute ${g.type === 'horizontal'
                  ? 'left-4 top-1/2 -translate-y-1/2'
                  : 'top-4 left-1/2 -translate-x-1/2'
                } bg-cyan-500/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}
              >
                {Math.round(g.position)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

