import { Upload, Brain, Sparkles, Loader } from 'lucide-react';
import clsx from 'clsx';

export type AnalysisPhase = 'upload' | 'analyze' | 'process';

interface AIAnalysisProgressProps {
  currentPhase: AnalysisPhase;
  estimatedTime: string;
  onCancel?: () => void;
}

const PHASES = [
  { id: 'upload', label: 'Nahrávám obrázky', icon: Upload },
  { id: 'analyze', label: 'AI analyzuje', icon: Brain },
  { id: 'process', label: 'Zpracovávám', icon: Sparkles },
] as const;

export const AIAnalysisProgress = ({ 
  currentPhase, 
  estimatedTime,
  onCancel 
}: AIAnalysisProgressProps) => {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-mono text-white">AI Analýza</h3>
          <p className="text-white/50 text-sm mt-1">Odhadovaný čas: {estimatedTime}</p>
        </div>

        {/* Progress steps */}
        <div className="space-y-3">
          {PHASES.map((phase, index) => {
            const isActive = index === currentIndex;
            const isDone = index < currentIndex;
            const Icon = phase.icon;
            
            return (
              <div 
                key={phase.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg transition-all',
                  isActive && 'bg-primary/10 border border-primary/30',
                  isDone && 'bg-green-500/10',
                  !isActive && !isDone && 'opacity-40'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  isActive && 'bg-primary/20',
                  isDone && 'bg-green-500/20'
                )}>
                  {isActive ? (
                    <Loader className="w-4 h-4 text-primary animate-spin" />
                  ) : isDone ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <Icon className="w-4 h-4 text-white/40" />
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
            className="w-full py-2 text-white/50 hover:text-white/70 text-sm font-mono transition-colors"
          >
            Zrušit
          </button>
        )}
      </div>
    </div>
  );
};
