import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ThumbsUp, Plus, X, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { SEOHead } from '../components/SEOHead';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  votes: number;
  votedBy: string[];
  authorId: string;
  authorName: string;
  createdAt: number;
  status: 'new' | 'planned' | 'in-progress' | 'done';
}

const STORAGE_KEY = 'earcheo-features';

// Default features to show
const DEFAULT_FEATURES: FeatureRequest[] = [
  {
    id: '1',
    title: 'Export do GeoTIFF',
    description: 'Možnost exportovat aktuální pohled jako georeferovaný TIFF soubor pro použití v GIS software.',
    votes: 12,
    votedBy: [],
    authorId: 'system',
    authorName: 'eArcheo',
    createdAt: Date.now() - 86400000 * 7,
    status: 'planned'
  },
  {
    id: '2',
    title: 'Měření vzdáleností a ploch',
    description: 'Nástroj pro měření vzdáleností mezi body a výpočet ploch vybraných oblastí.',
    votes: 8,
    votedBy: [],
    authorId: 'system',
    authorName: 'eArcheo',
    createdAt: Date.now() - 86400000 * 5,
    status: 'new'
  },
  {
    id: '3',
    title: 'Uložení oblíbených lokací',
    description: 'Možnost ukládat a pojmenovávat oblíbené lokace pro rychlý přístup.',
    votes: 15,
    votedBy: [],
    authorId: 'system',
    authorName: 'eArcheo',
    createdAt: Date.now() - 86400000 * 3,
    status: 'in-progress'
  }
];

export const FeatureRequests = () => {
  const { user } = useAuth0();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');

  // Load features from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFeatures(JSON.parse(stored));
    } else {
      setFeatures(DEFAULT_FEATURES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FEATURES));
    }
  }, []);

  // Save features to localStorage
  const saveFeatures = (newFeatures: FeatureRequest[]) => {
    setFeatures(newFeatures);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFeatures));
  };

  const handleVote = (featureId: string) => {
    if (!user?.sub) return;
    
    const updated = features.map(f => {
      if (f.id === featureId) {
        const hasVoted = f.votedBy.includes(user.sub!);
        return {
          ...f,
          votes: hasVoted ? f.votes - 1 : f.votes + 1,
          votedBy: hasVoted 
            ? f.votedBy.filter(id => id !== user.sub)
            : [...f.votedBy, user.sub!]
        };
      }
      return f;
    });
    saveFeatures(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user?.sub) return;

    const newFeature: FeatureRequest = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      votes: 1,
      votedBy: [user.sub],
      authorId: user.sub,
      authorName: user.name || user.email || 'Anonymous',
      createdAt: Date.now(),
      status: 'new'
    };

    saveFeatures([newFeature, ...features]);
    setNewTitle('');
    setNewDescription('');
    setIsModalOpen(false);
  };

  const sortedFeatures = [...features].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    return b.createdAt - a.createdAt;
  });

  const getStatusColor = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'new': return 'bg-white/10 text-white/60';
      case 'planned': return 'bg-blue-500/20 text-blue-400';
      case 'in-progress': return 'bg-amber-500/20 text-amber-400';
      case 'done': return 'bg-green-500/20 text-green-400';
    }
  };

  const getStatusLabel = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'new': return 'Nový';
      case 'planned': return 'Plánováno';
      case 'in-progress': return 'V realizaci';
      case 'done': return 'Hotovo';
    }
  };

  return (
    <>
      <SEOHead
        title="Feature Requests"
        description="Navrhujte nové funkce a hlasujte o tom, co chcete vidět dál v eArcheo. Komunitní návrhy a prioritizace funkcí pro dálkový archeologický průzkum."
        keywords="feature requests, nové funkce, hlasování, komunita, návrhy funkcí, eArcheo roadmap"
        canonicalUrl="/features"
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-surface/50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl text-white mb-2">Feature Requests</h1>
              <p className="text-white/50 font-mono text-sm">
                Navrhujte nové funkce a hlasujte o tom, co chcete vidět dál.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-xl text-primary font-mono text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Nový návrh
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
                    user?.sub && feature.votedBy.includes(user.sub)
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-primary/30 hover:text-primary"
                  )}
                >
                  <ThumbsUp className="w-5 h-5" />
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
                  <p className="text-white/50 font-mono text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-4 text-white/30 text-xs font-mono">
                    <span>{feature.authorName}</span>
                    <span>•</span>
                    <span>{new Date(feature.createdAt).toLocaleDateString('cs-CZ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedFeatures.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-mono">Zatím žádné návrhy. Buďte první!</p>
          </div>
        )}
      </div>

      {/* New Feature Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl text-background font-display tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                >
                  Odeslat
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

