import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useEquipment } from '../../hooks/useEquipment';
import type { Equipment, EquipmentType, CreateEquipmentRequest } from '../../types/database';

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EquipmentForm = ({ equipment, onClose, onSuccess }: EquipmentFormProps) => {
  const { createEquipment, updateEquipment } = useEquipment({ autoFetch: false });
  const [loading, setLoading] = useState(false);
  const isEditing = !!equipment;
  
  const [formData, setFormData] = useState<CreateEquipmentRequest>({
    name: '',
    type: 'DETECTOR',
    manufacturer: '',
    model: '',
    notes: '',
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        type: equipment.type,
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        notes: equipment.notes || '',
      });
    }
  }, [equipment]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vyplňte název vybavení');
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSend = {
        name: formData.name.trim(),
        type: formData.type,
        manufacturer: formData.manufacturer?.trim() || undefined,
        model: formData.model?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };
      
      if (isEditing && equipment) {
        await updateEquipment(equipment.id, dataToSend);
        toast.success('Vybavení bylo aktualizováno');
      } else {
        await createEquipment(dataToSend);
        toast.success('Vybavení bylo přidáno');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Submit equipment error:', error);
      toast.error(isEditing ? 'Chyba při aktualizaci vybavení' : 'Chyba při vytváření vybavení');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-primary/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">
            {isEditing ? 'Upravit vybavení' : 'Přidat vybavení'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Název */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Název *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="např. Garrett ACE 400i"
            />
          </div>
          
          {/* Typ */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Typ *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EquipmentType })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
              required
            >
              <option value="DETECTOR">Detektor kovů</option>
              <option value="GPS">GPS zařízení</option>
              <option value="OTHER">Ostatní</option>
            </select>
          </div>

          {/* Grid pro manufacturer a model */}
          <div className="grid grid-cols-2 gap-4">
            {/* Výrobce */}
            <div>
              <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                Výrobce
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="např. Garrett"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="např. ACE 400i"
              />
            </div>
          </div>
          
          {/* Poznámky */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Poznámky
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Dodatečné informace o vybavení..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 font-mono text-sm transition-colors"
              disabled={loading}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                isEditing ? 'Uložit změny' : 'Přidat vybavení'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


