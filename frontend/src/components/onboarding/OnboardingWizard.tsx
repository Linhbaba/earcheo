import { useState } from 'react';
import { X, Coins, Mail, Medal, Target, Check, Loader, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import type { CollectorType } from '../../types/database';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (collectorTypes: CollectorType[]) => Promise<void>;
  onSkip: () => Promise<void>;
}

const COLLECTOR_TYPES: Array<{
  id: CollectorType;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  { 
    id: 'NUMISMATIST', 
    icon: <Coins className="w-8 h-8" />, 
    label: 'Numismatik', 
    description: 'Mince, bankovky, medaile a žetony',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  { 
    id: 'PHILATELIST', 
    icon: <Mail className="w-8 h-8" />, 
    label: 'Filatelista', 
    description: 'Poštovní známky, obálky a celistvosti',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  { 
    id: 'MILITARIA', 
    icon: <Medal className="w-8 h-8" />, 
    label: 'Sběratel militárií', 
    description: 'Vojenské předměty, odznaky a výstroj',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  { 
    id: 'DETECTORIST', 
    icon: <Target className="w-8 h-8" />, 
    label: 'Detektorář', 
    description: 'Hledání artefaktů a terénní průzkum',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
];

export const OnboardingWizard = ({ isOpen, onComplete, onSkip }: OnboardingWizardProps) => {
  const [selectedTypes, setSelectedTypes] = useState<CollectorType[]>([]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleType = (type: CollectorType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await onComplete(selectedTypes);
      toast.success('Nastavení uloženo!');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await onSkip();
    } catch (error) {
      console.error('Skip error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl bg-surface/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-white/10">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 rounded-tr-2xl" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-primary">
                    Vítejte v eArcheo!
                  </h2>
                  <p className="text-white/50 font-mono text-xs mt-0.5">
                    Řekněte nám o sobě
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Přeskočit"
              >
                <X className="w-5 h-5 text-white/50 hover:text-white" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-white/70 font-mono text-sm mb-6 text-center">
              Vyberte, co vás zajímá. Můžete vybrat více možností.<br />
              <span className="text-white/40">Toto nastavení můžete kdykoliv změnit v profilu.</span>
            </p>
            
            {/* Collector Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COLLECTOR_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={clsx(
                      "relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left group",
                      isSelected
                        ? `${type.bgColor} ${type.borderColor} shadow-lg`
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {/* Checkbox indicator */}
                    <div className={clsx(
                      "absolute top-3 right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? `${type.bgColor} ${type.borderColor}`
                        : "border-white/20"
                    )}>
                      {isSelected && <Check className={`w-4 h-4 ${type.color}`} />}
                    </div>
                    
                    {/* Icon */}
                    <div className={clsx(
                      "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      isSelected
                        ? `${type.bgColor} ${type.borderColor} border`
                        : "bg-white/10 border border-white/10"
                    )}>
                      <span className={isSelected ? type.color : 'text-white/50'}>
                        {type.icon}
                      </span>
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 pr-6">
                      <h3 className={clsx(
                        "font-display text-lg mb-1 transition-colors",
                        isSelected ? type.color : "text-white"
                      )}>
                        {type.label}
                      </h3>
                      <p className="text-white/50 font-mono text-xs leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-white/50 hover:text-white font-mono text-sm transition-colors"
              disabled={saving}
            >
              Přeskočit
            </button>
            
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-xl text-primary font-mono text-sm tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  {selectedTypes.length > 0 ? 'Pokračovat' : 'Pokračovat bez výběru'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          
          {/* Bottom corner decorations */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
        </div>
      </div>
    </>
  );
};
