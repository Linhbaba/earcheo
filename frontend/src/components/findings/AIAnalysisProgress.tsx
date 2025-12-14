import { Upload, Brain, Sparkles, Loader } from 'lucide-react';
import clsx from 'clsx';

export type AnalysisPhase = 'upload' | 'analyze' | 'process';

interface AIAnalysisProgressProps {
  currentPhase: AnalysisPhase;
  estimatedTime: string;
  onCancel?: () => void;
  images?: string[]; // Base64 or blob URLs pro scan efekt
}

const PHASES = [
  { id: 'upload', label: 'Nahrávám obrázky', icon: Upload },
  { id: 'analyze', label: 'AI analyzuje', icon: Brain },
  { id: 'process', label: 'Zpracovávám', icon: Sparkles },
] as const;

export const AIAnalysisProgress = ({ 
  currentPhase, 
  estimatedTime,
  onCancel,
  images = []
}: AIAnalysisProgressProps) => {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center">
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 162, 158, 0.3); }
          50% { box-shadow: 0 0 40px rgba(168, 162, 158, 0.6); }
        }
      `}</style>
      
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <Brain className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-mono text-white">AI Analýza</h3>
          <p className="text-white/50 text-xs mt-1">Odhadovaný čas: {estimatedTime}</p>
        </div>

        {/* Image previews with scan effect */}
        {images.length > 0 && (
          <div className="flex justify-center gap-3">
            {images.slice(0, 4).map((img, idx) => (
              <div 
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/30"
                style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
              >
                <img 
                  src={img} 
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Scan line overlay */}
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                >
                  <div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-80"
                    style={{ 
                      animation: 'scan 1.5s ease-in-out infinite',
                      animationDelay: `${idx * 0.2}s`
                    }}
                  />
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        )}

        {/* Progress steps */}
        <div className="space-y-2">
          {PHASES.map((phase, index) => {
            const isActive = index === currentIndex;
            const isDone = index < currentIndex;
            const Icon = phase.icon;
            
            return (
              <div 
                key={phase.id}
                className={clsx(
                  'flex items-center gap-3 p-2.5 rounded-lg transition-all',
                  isActive && 'bg-primary/10 border border-primary/30',
                  isDone && 'bg-green-500/10',
                  !isActive && !isDone && 'opacity-40'
                )}
              >
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center',
                  isActive && 'bg-primary/20',
                  isDone && 'bg-green-500/20'
                )}>
                  {isActive ? (
                    <Loader className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : isDone ? (
                    <span className="text-green-400 text-sm">✓</span>
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-white/40" />
                  )}
                </div>
                <span className={clsx(
                  'font-mono text-sm',
                  isActive && 'text-primary',
                  isDone && 'text-green-400',
                  !isActive && !isDone && 'text-white/40'
                )}>
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-white/50 hover:text-white/70 text-xs font-mono transition-colors"
          >
            Zrušit analýzu
          </button>
        )}
      </div>
    </div>
  );
};
