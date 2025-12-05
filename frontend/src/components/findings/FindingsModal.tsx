import { useState, useEffect } from 'react';
import { Plus, Package, X, Sparkles } from 'lucide-react';
import { useFindings } from '../../hooks/useFindings';
import { useProfile } from '../../hooks/useProfile';
import { FindingCard } from './FindingCard';
import { FindingForm } from './FindingForm';
import { FindingDetail } from './FindingDetail';
import { LoadingSkeleton, EmptyState } from '../shared';
import { getCategoriesForCollectorTypes, COLLECTOR_TYPE_LABELS } from '../../utils/collectorPresets';
import type { Finding } from '../../types/database';

interface FindingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialShowForm?: boolean;
}

export const FindingsModal = ({ isOpen, onClose, initialShowForm = false }: FindingsModalProps) => {
  const { findings, loading, fetchFindings } = useFindings();
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(initialShowForm);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Get suggested categories based on user's collector types
  const suggestedCategories = getCategoriesForCollectorTypes(profile?.collectorTypes || []);
  
  // Get collector type labels for display
  const collectorTypeLabels = profile?.collectorTypes?.map(t => COLLECTOR_TYPE_LABELS[t]) || [];
  
  // Refresh data when modal opens
  useEffect(() => {
    if (isOpen && !loading) {
      fetchFindings();
    }
  }, [isOpen]);
  
  // Update showForm when initialShowForm changes
  useEffect(() => {
    if (isOpen && initialShowForm) {
      setShowForm(true);
    } else if (!isOpen) {
      // Reset form when modal closes
      setShowForm(false);
    }
  }, [isOpen, initialShowForm]);
  
  if (!isOpen) return null;

  // Extract all unique categories from findings
  const allCategories = Array.from(
    new Set(
      findings.flatMap(f => 
        f.category ? f.category.split(',').map(c => c.trim()) : []
      )
    )
  ).sort();
  
  // Combine user's categories with suggested ones (prioritize user's)
  const displayCategories = [...new Set([...allCategories, ...suggestedCategories.slice(0, 5)])];

  // Filter findings by category
  const filteredFindings = activeCategory === 'all' 
    ? findings 
    : findings.filter(f => 
        f.category && f.category.split(',').map(c => c.trim()).includes(activeCategory)
      );

  // Count findings per category
  const getCategoryCount = (category: string) => {
    if (category === 'all') return findings.length;
    return findings.filter(f => 
      f.category && f.category.split(',').map(c => c.trim()).includes(category)
    ).length;
  };
  
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
              <div>
                <h2 className="font-display text-xl tracking-wider text-primary">
                  Moje Nálezy
                </h2>
                {collectorTypeLabels.length > 0 && (
                  <p className="text-white/40 font-mono text-[10px] mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {collectorTypeLabels.join(' • ')}
                  </p>
                )}
              </div>
              
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
            
            {/* Filters - Dynamic categories with suggestions */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 border rounded-md font-mono text-xs transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-primary/20 border-primary/30 text-primary'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Vše ({getCategoryCount('all')})
              </button>
              
              {displayCategories.map(category => {
                const count = getCategoryCount(category);
                const isSuggested = !allCategories.includes(category) && suggestedCategories.includes(category);
                
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 border rounded-md font-mono text-xs transition-colors ${
                      activeCategory === category
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : isSuggested
                          ? 'bg-white/5 border-dashed border-white/20 text-white/30 hover:text-white/50 hover:bg-white/10'
                          : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    title={isSuggested ? 'Doporučená kategorie' : undefined}
                  >
                    {category} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="h-[calc(80vh-120px)] overflow-y-auto px-5 py-4">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredFindings.length === 0 ? (
              <EmptyState
                icon={Package}
                title={activeCategory === 'all' ? 'Zatím žádné nálezy' : 'Žádné nálezy v této kategorii'}
                description={activeCategory === 'all' 
                  ? 'Začněte přidáním svého prvního archeologického nálezu'
                  : 'Zkuste vybrat jinou kategorii nebo přidejte nový nález'
                }
                action={{
                  label: activeCategory === 'all' ? 'Přidat první nález' : 'Přidat nález',
                  onClick: () => setShowForm(true)
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onClick={() => setSelectedFinding(finding)}
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
          finding={editingFinding}
          onClose={() => {
            setShowForm(false);
            setEditingFinding(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingFinding(null);
            // Refresh findings list
            fetchFindings();
          }}
        />
      )}

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <FindingDetail
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          onEdit={() => {
            setEditingFinding(selectedFinding);
            setSelectedFinding(null);
            setShowForm(true);
          }}
          onDelete={() => {
            setSelectedFinding(null);
            // Refresh findings list after delete
            fetchFindings();
          }}
        />
      )}
    </>
  );
};

