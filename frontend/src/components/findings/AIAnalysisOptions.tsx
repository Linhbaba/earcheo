import { Zap, Search, GraduationCap, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export type AnalysisLevel = 'none' | 'quick' | 'detailed' | 'expert';

interface AIAnalysisOptionsProps {
  selectedLevel: AnalysisLevel;
  onSelect: (level: AnalysisLevel) => void;
  userCredits: number;
  isRequired?: boolean; // true pokud typ = UNKNOWN
  disabled?: boolean;
}

const ANALYSIS_OPTIONS: {
  id: AnalysisLevel;
  icon: typeof Zap;
  label: string;
  description: string;
  cost: number | string;
  features: string[];
  color: string;
}[] = [
  {
    id: 'none',
    icon: Sparkles,
    label: 'Bez AI',
    description: 'Vyplním ručně',
    cost: 0,
    features: [],
    color: 'slate',
  },
  {
    id: 'quick',
    icon: Zap,
    label: 'Rychlá',
    description: '~5 sekund',
    cost: 1,
    features: ['Název a kategorie', 'Období a materiál', 'Základní popis'],
    color: 'blue',
  },
  {
    id: 'detailed',
    icon: Search,
    label: 'Detailní',
    description: '~15 sekund',
    cost: 5,
    features: ['Vše z rychlé', 'Katalogová čísla', 'Mincovna/vydavatel', 'Stav a grading'],
    color: 'amber',
  },
  {
    id: 'expert',
    icon: GraduationCap,
    label: 'Expertní',
    description: '2-5 minut',
    cost: '~25',
    features: ['Vše z detailní', 'Prohledá katalogy', 'Aukční srovnání', 'Odhad hodnoty', 'Zdroje a citace'],
    color: 'purple',
  },
];

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  slate: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    glow: '',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
  },
};

export const AIAnalysisOptions = ({
  selectedLevel,
  onSelect,
  userCredits,
  isRequired = false,
  disabled = false,
}: AIAnalysisOptionsProps) => {
  const filteredOptions = isRequired 
    ? ANALYSIS_OPTIONS.filter(opt => opt.id !== 'none')
    : ANALYSIS_OPTIONS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono text-sm text-white/70 uppercase tracking-wider">
            🤖 AI Analýza
          </h3>
          {isRequired && (
            <p className="text-xs text-purple-400 mt-1">
              Vyžadováno pro určení typu nálezu
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
          <span className="text-primary font-mono text-sm">🪙 {userCredits}</span>
          <span className="text-white/40 text-xs">kreditů</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredOptions.map((option) => {
          const colors = COLOR_CLASSES[option.color];
          const isSelected = selectedLevel === option.id;
          const cost = typeof option.cost === 'number' ? option.cost : 25;
          const canAfford = userCredits >= cost;
          const isDisabled = disabled || (!canAfford && option.id !== 'none');

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !isDisabled && onSelect(option.id)}
              disabled={isDisabled}
              className={clsx(
                'relative p-4 rounded-xl border transition-all text-left',
                isSelected
                  ? `${colors.bg} ${colors.border} ${colors.glow}`
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Badge pro cenu */}
              <div className={clsx(
                'absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-mono',
                isSelected ? `${colors.bg} ${colors.text}` : 'bg-white/10 text-white/60'
              )}>
                {option.cost === 0 ? 'Zdarma' : `${option.cost} 🪙`}
              </div>

              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  isSelected ? `${colors.bg} ${colors.border} border` : 'bg-white/5 border border-white/10'
                )}>
                  <option.icon className={clsx(
                    'w-5 h-5',
                    isSelected ? colors.text : 'text-white/60'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'font-mono text-sm font-medium',
                      isSelected ? colors.text : 'text-white/80'
                    )}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{option.description}</p>

                  {option.features.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="text-[10px] text-white/50 flex items-center gap-1">
                          <span className={isSelected ? colors.text : 'text-white/30'}>•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className={clsx(
                  'absolute inset-0 rounded-xl border-2 pointer-events-none',
                  colors.border
                )} />
              )}

              {/* Insufficient credits warning */}
              {!canAfford && option.id !== 'none' && (
                <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                  <span className="text-xs text-red-400 font-mono">
                    Nedostatek kreditů
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedLevel !== 'none' && (
        <p className="text-xs text-white/40 font-mono text-center">
          💡 AI vyplní pole, která můžeš následně upravit
        </p>
      )}
    </div>
  );
};

