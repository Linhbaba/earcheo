import { useState, type FormEvent } from 'react';
import { X, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useFindings } from '../../hooks/useFindings';
import type { CreateFindingRequest } from '../../types/database';

interface FindingFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const FindingForm = ({ onClose, onSuccess }: FindingFormProps) => {
  const { createFinding } = useFindings();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateFindingRequest>({
    title: '',
    latitude: 50.0755, // Default Praha
    longitude: 14.4378,
    date: new Date().toISOString().split('T')[0], // Today
    description: '',
    category: 'coins',
    isPublic: false,
  });
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert date to ISO string with time
      const dataToSend = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };
      
      await createFinding(dataToSend);
      toast.success('Nález byl úspěšně přidán!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Create finding error:', error);
      toast.error('Chyba při vytváření nálezu');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-primary/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">Přidat nález</h2>
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
              Název nálezu *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="např. Římská mince"
            />
          </div>
          
          {/* Kategorie */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Kategorie *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="coins">Mince</option>
              <option value="tools">Nástroje</option>
              <option value="pottery">Keramika</option>
              <option value="jewelry">Šperky</option>
              <option value="weapons">Zbraně</option>
              <option value="other">Ostatní</option>
            </select>
          </div>
          
          {/* Datum */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Datum nálezu *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          
          {/* GPS souřadnice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                Latitude *
              </label>
              <input
                type="number"
                required
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                Longitude *
              </label>
              <input
                type="number"
                required
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          
          {/* Popis */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Popis *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Podrobný popis nálezu..."
            />
          </div>
          
          {/* Public checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-black/40 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label htmlFor="isPublic" className="text-sm text-white/70 font-mono">
              Sdílet veřejně (ostatní uživatelé mohou vidět)
            </label>
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
                'Přidat nález'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

