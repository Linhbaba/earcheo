import { useState, useEffect } from 'react';
import { X, Plus, Package, Wrench } from 'lucide-react';
import { useEquipment } from '../../hooks/useEquipment';
import { EquipmentCard } from './EquipmentCard';
import { EquipmentForm } from './EquipmentForm';
import { LoadingSkeleton, EmptyState } from '../shared';
import type { Equipment, EquipmentType } from '../../types/database';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquipmentModal = ({ isOpen, onClose }: EquipmentModalProps) => {
  const { equipment, loading, fetchEquipment } = useEquipment();
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [activeFilter, setActiveFilter] = useState<EquipmentType | 'all'>('all');
  
  // Refresh data when modal opens
  useEffect(() => {
    if (isOpen && !loading) {
      fetchEquipment();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  // Filter equipment by type
  const filteredEquipment = activeFilter === 'all'
    ? equipment
    : equipment.filter(e => e.type === activeFilter);

  // Count by type
  const getTypeCount = (type: EquipmentType | 'all') => {
    if (type === 'all') return equipment.length;
    return equipment.filter(e => e.type === type).length;
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEquipment(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEquipment(null);
    fetchEquipment();
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
        <div className="w-full max-w-5xl h-[80vh] bg-surface/95 backdrop-blur-md border border-primary/30 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="relative border-b border-white/10 px-5 py-3">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl tracking-wider text-primary">
                  Moje Vybavení
                </h2>
                <p className="text-white/50 font-mono text-xs mt-1">
                  Spravujte své detektory, GPS a další vybavení
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingEquipment(null);
                    setShowForm(true);
                  }}
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
            
            {/* Filter tabs */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 border rounded-md font-mono text-xs transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary/20 border-primary/30 text-primary'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Vše ({getTypeCount('all')})
              </button>
              
              <button
                onClick={() => setActiveFilter('DETECTOR')}
                className={`px-3 py-1 border rounded-md font-mono text-xs transition-colors ${
                  activeFilter === 'DETECTOR'
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Detektory ({getTypeCount('DETECTOR')})
              </button>

              <button
                onClick={() => setActiveFilter('GPS')}
                className={`px-3 py-1 border rounded-md font-mono text-xs transition-colors ${
                  activeFilter === 'GPS'
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                GPS ({getTypeCount('GPS')})
              </button>

              <button
                onClick={() => setActiveFilter('OTHER')}
                className={`px-3 py-1 border rounded-md font-mono text-xs transition-colors ${
                  activeFilter === 'OTHER'
                    ? 'bg-white/20 border-white/30 text-white/80'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Ostatní ({getTypeCount('OTHER')})
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="h-[calc(80vh-120px)] overflow-y-auto px-5 py-4">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredEquipment.length === 0 ? (
              <EmptyState
                icon={activeFilter === 'all' ? Package : Wrench}
                title={activeFilter === 'all' ? 'Zatím žádné vybavení' : `Žádné ${activeFilter === 'DETECTOR' ? 'detektory' : activeFilter === 'GPS' ? 'GPS zařízení' : 'ostatní vybavení'}`}
                description={activeFilter === 'all' 
                  ? 'Přidejte své první vybavení pro evidenci'
                  : 'Zkuste vybrat jinou kategorii nebo přidejte nové vybavení'
                }
                action={{
                  label: activeFilter === 'all' ? 'Přidat první vybavení' : 'Přidat vybavení',
                  onClick: () => {
                    setEditingEquipment(null);
                    setShowForm(true);
                  }
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredEquipment.map((eq) => (
                  <EquipmentCard
                    key={eq.id}
                    equipment={eq}
                    onEdit={() => handleEdit(eq)}
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
      
      {/* Equipment Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editingEquipment}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

