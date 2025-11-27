import { useState } from 'react';
import { X, Plus, ThumbsUp, TrendingUp, Clock, Trash2, Loader, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';
import { useFeatureRequests } from '../hooks/useFeatureRequests';
import { ConfirmDialog } from './shared';

interface FeatureRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureRequestsModal = ({ isOpen, onClose }: FeatureRequestsModalProps) => {
  const { user } = useAuth0();
  const { features, loading, createFeature, toggleVote, deleteFeature } = useFeatureRequests();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      await createFeature({
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      toast.success('Návrh byl přidán!');
      setNewTitle('');
      setNewDescription('');
      setShowForm(false);
    } catch (error) {
      console.error('Create feature error:', error);
      toast.error('Chyba při vytváření návrhu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (featureId: string) => {
    setVotingId(featureId);
    try {
      await toggleVote(featureId);
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Chyba při hlasování');
    } finally {
      setVotingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteFeature(deleteConfirmId);
      toast.success('Návrh byl smazán');
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Chyba při mazání návrhu');
    }
  };

  const sortedFeatures = [...features].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-white/10 text-white/60';
      case 'PLANNED': return 'bg-blue-500/20 text-blue-400';
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-400';
      case 'DONE': return 'bg-green-500/20 text-green-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW': return 'Nový';
      case 'PLANNED': return 'Plánováno';
      case 'IN_PROGRESS': return 'V realizaci';
      case 'DONE': return 'Hotovo';
      default: return 'Nový';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-surface/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl pointer-events-none" />
          
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4 bg-surface/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-primary tracking-wider">Návrhy funkcí</h2>
                <p className="text-white/50 font-mono text-xs mt-1">
                  Hlasujte o tom, co chcete vidět dál
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nový návrh
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white/70" />
                </button>
              </div>
            </div>

            {/* Sort tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSortBy('votes')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all",
                  sortBy === 'votes'
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Nejžádanější
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all",
                  sortBy === 'newest'
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                Nejnovější
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : sortedFeatures.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 font-mono">Zatím žádné návrhy. Buďte první!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all"
                >
                  Přidat první návrh
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className="group bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Vote button */}
                      <button
                        onClick={() => handleVote(feature.id)}
                        disabled={votingId === feature.id}
                        className={clsx(
                          "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all min-w-[70px]",
                          feature.hasVoted
                            ? "bg-primary/20 border-primary/50 text-primary"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-primary/30 hover:text-primary",
                          votingId === feature.id && "opacity-50 cursor-wait"
                        )}
                      >
                        {votingId === feature.id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <ThumbsUp className="w-5 h-5" />
                        )}
                        <span className="font-mono text-lg font-bold">{feature.votes}</span>
                      </button>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-white text-lg">{feature.title}</h3>
                          <span className={clsx(
                            "px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider",
                            getStatusColor(feature.status)
                          )}>
                            {getStatusLabel(feature.status)}
                          </span>
                        </div>
                        {feature.description && (
                          <p className="text-white/50 font-mono text-sm mb-4 leading-relaxed">
                            {feature.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-white/30 text-xs font-mono">
                            <span>{feature.authorName}</span>
                            <span>•</span>
                            <span>{new Date(feature.createdAt).toLocaleDateString('cs-CZ')}</span>
                          </div>
                          {/* Delete button - only for author */}
                          {user?.sub === feature.authorId && (
                            <button
                              onClick={() => setDeleteConfirmId(feature.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-mono text-xs transition-all"
                              title="Smazat návrh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Smazat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom corner decorations */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-2xl pointer-events-none" />
        </div>
      </div>

      {/* New Feature Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl text-white mb-6">Nový návrh</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/50 font-mono text-xs uppercase tracking-wider mb-2">
                  Název funkce *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Např. Export do PDF"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-white/50 font-mono text-xs uppercase tracking-wider mb-2">
                  Popis (volitelné)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Popište, co by funkce měla dělat a proč by byla užitečná..."
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-mono text-sm transition-colors"
                  disabled={submitting}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Ukládám...
                    </>
                  ) : (
                    'Odeslat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Smazat návrh?"
        message="Opravdu chcete smazat tento návrh? Tato akce je nevratná."
        confirmLabel="Ano, smazat"
        cancelLabel="Zrušit"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </>
  );
};
