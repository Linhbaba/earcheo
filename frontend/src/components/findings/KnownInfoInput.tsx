import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import type { FindingType } from '../../utils/findingFieldsConfig';

export interface KnownInfo {
  materialTags: string[];
  periodTags: string[];
  originTags: string[];
  notes: string;
}

interface KnownInfoInputProps {
  value: KnownInfo;
  onChange: (value: KnownInfo) => void;
  findingType: FindingType;
  disabled?: boolean;
}

// Tagy podle typu nálezu
const TAGS_BY_TYPE: Record<FindingType, {
  material: string[];
  period: string[];
  origin: string[];
}> = {
  COIN: {
    material: ['Stříbro', 'Zlato', 'Bronz', 'Měď', 'Billon', 'Nikl', 'Hliník'],
    period: ['Antika', 'Středověk', 'Novověk', '19. století', '20. století'],
    origin: ['Římské', 'Řecké', 'Keltské', 'České', 'Rakouské', 'Německé', 'Ruské'],
  },
  STAMP: {
    material: [],
    period: ['19. století', 'Meziválečné', 'Protektorát', 'Poválečné', 'Moderní'],
    origin: ['Československo', 'Rakousko-Uhersko', 'Německo', 'SSSR', 'USA'],
  },
  MILITARY: {
    material: ['Kov', 'Textil', 'Kůže', 'Dřevo', 'Porcelán'],
    period: ['Napoleonské', '1. sv. válka', '2. sv. válka', 'Studená válka'],
    origin: ['Rakousko-Uhersko', 'Německo', 'SSSR', 'USA', 'Československo', 'Británie'],
  },
  TERRAIN: {
    material: ['Keramika', 'Bronz', 'Železo', 'Kost', 'Kámen', 'Sklo'],
    period: ['Pravěk', 'Doba bronzová', 'Doba železná', 'Antika', 'Středověk', 'Novověk'],
    origin: [],
  },
  GENERAL: {
    material: ['Kov', 'Keramika', 'Sklo', 'Dřevo', 'Textil', 'Papír'],
    period: ['Starožitné', 'Historické', '19. století', '20. století'],
    origin: [],
  },
  UNKNOWN: {
    material: ['Kov', 'Keramika', 'Sklo', 'Dřevo', 'Textil', 'Kámen'],
    period: ['Antika', 'Středověk', 'Novověk', '19. století', '20. století'],
    origin: ['České', 'Rakouské', 'Německé'],
  },
};

export const KnownInfoInput = ({
  value,
  onChange,
  findingType,
  disabled = false,
}: KnownInfoInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tags = TAGS_BY_TYPE[findingType] || TAGS_BY_TYPE.GENERAL;

  const toggleTag = (category: 'materialTags' | 'periodTags' | 'originTags', tag: string) => {
    const currentTags = value[category];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onChange({ ...value, [category]: newTags });
  };

  const hasAnyData = 
    value.materialTags.length > 0 || 
    value.periodTags.length > 0 || 
    value.originTags.length > 0 || 
    value.notes.length > 0;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70 font-mono">
            💡 Známé informace
          </span>
          {hasAnyData && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-mono rounded-full">
              Vyplněno
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/50" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-black/20 animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs text-white/50">
            Vyber co už víš o nálezu - pomůže to AI s přesnější analýzou.
          </p>

          {/* Material tags */}
          {tags.material.length > 0 && (
            <div>
              <label className="block text-xs text-white/50 font-mono uppercase mb-2">
                Materiál
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.material.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('materialTags', tag)}
                    disabled={disabled}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-mono transition-all',
                      value.materialTags.includes(tag)
                        ? 'bg-primary/20 border border-primary/30 text-primary'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Period tags */}
          {tags.period.length > 0 && (
            <div>
              <label className="block text-xs text-white/50 font-mono uppercase mb-2">
                Období
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.period.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('periodTags', tag)}
                    disabled={disabled}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-mono transition-all',
                      value.periodTags.includes(tag)
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Origin tags */}
          {tags.origin.length > 0 && (
            <div>
              <label className="block text-xs text-white/50 font-mono uppercase mb-2">
                Původ
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.origin.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('originTags', tag)}
                    disabled={disabled}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-mono transition-all',
                      value.originTags.includes(tag)
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs text-white/50 font-mono uppercase mb-2">
              Vlastní poznámky
            </label>
            <textarea
              value={value.notes}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              disabled={disabled}
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="např. Našel jsem to na poli u Mušova, vypadá to na římskou minci..."
            />
            <p className="text-right text-[10px] text-white/30 mt-1">
              {value.notes.length}/500
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

