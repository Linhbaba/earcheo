import { Coins, Mail, Medal, Target, Package } from 'lucide-react';
import { FINDING_TYPE_META, type FindingType } from '../../utils/findingFieldsConfig';

interface FindingTypeSelectorProps {
  selectedType: FindingType | null;
  onSelect: (type: FindingType) => void;
  suggestedType?: FindingType;
}

// Mapování ikon
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Coins,
  Mail,
  Medal,
  Target,
  Package,
};

export const FindingTypeSelector = ({ selectedType, onSelect, suggestedType }: FindingTypeSelectorProps) => {
  const types = Object.entries(FINDING_TYPE_META) as [FindingType, typeof FINDING_TYPE_META[FindingType]][];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl text-white mb-2">
          Co chceš přidat?
        </h3>
        <p className="text-white/50 font-mono text-sm">
          Vyber typ nálezu pro zobrazení relevantních polí
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {types.map(([type, meta]) => {
          const Icon = ICONS[meta.icon];
          const isSelected = selectedType === type;
          const isSuggested = suggestedType === type && !selectedType;
          const { color } = meta;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`
                group relative p-4 rounded-xl border transition-all duration-200
                ${isSelected 
                  ? `${color.bg} ${color.border} ${color.glow.replace('group-hover:', '')}` 
                  : `bg-white/5 border-white/10 hover:bg-white/10 ${color.hoverBorder}`
                }
              `}
            >
              {/* Suggested badge */}
              {isSuggested && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-full text-[9px] text-primary font-mono uppercase">
                  Navrženo
                </span>
              )}

              <div className="flex flex-col items-center text-center gap-3">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all
                  ${isSelected 
                    ? `${color.bg} ${color.border}` 
                    : 'bg-white/5 border border-white/10 group-hover:border-white/20'
                  }
                `}>
                  {Icon && (
                    <Icon className={`w-6 h-6 ${isSelected ? color.text : 'text-white/60 group-hover:text-white/80'}`} />
                  )}
                </div>
                
                <div>
                  <p className={`font-mono text-sm font-medium ${isSelected ? color.text : 'text-white/80'}`}>
                    {meta.label.split(' / ')[0]}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-tight">
                    {meta.description}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className={`absolute inset-0 rounded-xl border-2 ${color.border} pointer-events-none`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Skip option */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => onSelect('GENERAL')}
          className="text-xs text-white/40 hover:text-white/60 font-mono transition-colors"
        >
          Přeskočit výběr (obecný předmět)
        </button>
      </div>
    </div>
  );
};

