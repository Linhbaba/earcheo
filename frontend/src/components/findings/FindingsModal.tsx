import { useState } from 'react';
import { Plus, Package, X } from 'lucide-react';
import { useFindings } from '../../hooks/useFindings';
import { FindingCard } from './FindingCard';
import { FindingForm } from './FindingForm';
import { LoadingSkeleton, EmptyState } from '../shared';

interface FindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FindingsModal = ({ isOpen, onClose }: FindingsModalProps) => {
  const { findings, loading } = useFindings();
  const [showForm, setShowForm] = useState(false);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-4xl h-[80vh] bg-surface/95 backdrop-blur-md border border-primary/30 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="relative border-b border-white/10 px-5 py-3">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
            
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-primary">
                Moje Nálezy
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-xs tracking-wider transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Přidat
                </button>
                
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Zavřít"
                >
                  <X className="w-5 h-5 text-white/70 hover:text-white" />
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-md text-primary font-mono text-xs">
                Vše ({findings.length})
              </button>
              <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors">
                Mince
              </button>
              <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors">
                Nástroje
              </button>
              <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/10 font-mono text-xs transition-colors">
                Keramika
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="h-[calc(80vh-120px)] overflow-y-auto px-5 py-4">
            {loading ? (
              <LoadingSkeleton />
            ) : findings.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Zatím žádné nálezy"
                description="Začněte přidáním svého prvního archeologického nálezu"
                action={{
                  label: 'Přidat první nález',
                  onClick: () => setShowForm(true)
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {findings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onClick={() => {
                      // TODO: Otevřít detail nálezu (EXTENDED část)
                      console.log('Detail nálezu:', finding.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Bottom corner decorations */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-xl" />
        </div>
      </div>
      
      {/* Finding Form Modal */}
      {showForm && (
        <FindingForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            // Findings list se automaticky aktualizuje díky useFindings hook
          }}
        />
      )}
    </>
  );
};

