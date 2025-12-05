import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ThumbsUp, Plus, X, Sparkles, TrendingUp, Clock, Trash2, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { SEOHead } from '../components/SEOHead';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category?: string;
  votes: number;
  userVoted: boolean;
  userId: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const CATEGORIES = ['Mapa', 'Nálezy', 'UI/UX', 'Data', 'Ostatní'];

export const FeatureRequests = () => {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Ostatní');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch features from API
  const fetchFeatures = async () => {
    try {
      setLoading(true);
      
      let headers: HeadersInit = {};
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          headers = { 'Authorization': `Bearer ${token}` };
        } catch {
          // Continue without token
        }
      }

      const response = await fetch(`${API_URL}/api/features`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
      toast.error('Nepodařilo se načíst návrhy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [isAuthenticated]);

  const handleVote = async (featureId: string) => {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: '/features' } });
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features?id=${featureId}&action=vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to vote');

      const updated = await response.json();
      setFeatures(prev => prev.map(f => f.id === featureId ? updated : f));
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Nepodařilo se hlasovat');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${API_URL}/api/features`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          category: newCategory,
        }),
      });

      if (!response.ok) throw new Error('Failed to create feature');

      const newFeature = await response.json();
      setFeatures(prev => [newFeature, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewCategory('Ostatní');
      setIsModalOpen(false);
      toast.success('Návrh byl odeslán');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Nepodařilo se vytvořit návrh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (featureId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features?id=${featureId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');

      setFeatures(prev => prev.filter(f => f.id !== featureId));
      setDeleteConfirmId(null);
      toast.success('Návrh byl smazán');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Nepodařilo se smazat návrh');
    }
  };

  const sortedFeatures = [...features].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-white/10 text-white/60';
    switch (category.toLowerCase()) {
      case 'mapa': return 'bg-blue-500/20 text-blue-400';
      case 'nálezy': return 'bg-amber-500/20 text-amber-400';
      case 'ui/ux': return 'bg-purple-500/20 text-purple-400';
      case 'data': return 'bg-green-500/20 text-green-400';
      default: return 'bg-white/10 text-white/60';
    }
  };

  return (
    <>
      <SEOHead
        title="Návrhy funkcí"
        description="Navrhujte nové funkce a hlasujte o tom, co chcete vidět dál v eArcheo. Komunitní návrhy a prioritizace funkcí pro dálkový archeologický průzkum."
        keywords="návrhy funkcí, nové funkce, hlasování, komunita, feature requests, eArcheo roadmap"
        canonicalUrl="/features"
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-surface/50 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl text-white mb-2">Návrhy funkcí</h1>
                <p className="text-white/50 font-mono text-sm">
                  Navrhujte nové funkce a hlasujte o tom, co chcete vidět dál.
                </p>
              </div>
              <button
                onClick={() => isAuthenticated ? setIsModalOpen(true) : loginWithRedirect({ appState: { returnTo: '/features' } })}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-xl text-primary font-mono text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
              >
                <Plus className="w-4 h-4" />
                {isAuthenticated ? 'Nový návrh' : 'Přihlásit se a navrhnout'}
              </button>
            </div>

            {/* Sort tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSortBy('votes')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all",
                  sortBy === 'votes'
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Nejžádanější
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all",
                  sortBy === 'newest'
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Clock className="w-4 h-4" />
                Nejnovější
              </button>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : sortedFeatures.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-mono">Zatím žádné návrhy. Buďte první!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFeatures.map(feature => (
                <div
                  key={feature.id}
                  className="group bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex gap-6">
                    {/* Vote button */}
                    <button
                      onClick={() => handleVote(feature.id)}
                      className={clsx(
                        "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all min-w-[70px]",
                        feature.userVoted
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-primary/30 hover:text-primary"
                      )}
                      title={!isAuthenticated ? "Přihlaste se pro hlasování" : undefined}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-mono text-lg font-bold">{feature.votes}</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-display text-white text-lg">{feature.title}</h3>
                        {feature.category && feature.category.toLowerCase() !== 'ostatní' && (
                          <span className={clsx(
                            "px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider",
                            getCategoryColor(feature.category)
                          )}>
                            {feature.category}
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 font-mono text-sm mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/30 text-xs font-mono">
                          <span>{new Date(feature.createdAt).toLocaleDateString('cs-CZ')}</span>
                        </div>
                        {/* Delete button - only for author */}
                        {isAuthenticated && user?.sub === feature.userId && (
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

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <div className="relative bg-surface border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="font-display text-xl text-white mb-3">Smazat návrh?</h2>
              <p className="text-white/50 font-mono text-sm mb-6">
                Opravdu chcete smazat tento návrh? Tato akce je nevratná.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-mono text-sm transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 font-mono text-sm transition-all"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Feature Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display text-2xl text-white mb-6">Nový návrh</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/50 font-mono text-xs uppercase tracking-wider mb-2">
                    Název funkce
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Např. Export do PDF"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/50 font-mono text-xs uppercase tracking-wider mb-2">
                    Kategorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 font-mono text-xs uppercase tracking-wider mb-2">
                    Popis
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Popište, co by funkce měla dělat a proč by byla užitečná..."
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 font-mono text-sm transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl text-background font-display tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Odeslat'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
