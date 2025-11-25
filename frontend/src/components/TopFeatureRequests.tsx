import { useAuth0 } from '@auth0/auth0-react';
import { ThumbsUp, TrendingUp, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const STORAGE_KEY = 'earcheo-features-v2';

// Default features to show (same as in FeatureRequests.tsx)
const DEFAULT_FEATURES: FeatureRequest[] = [
  {
    id: '1',
    title: 'Možnost zvolit si na jaké straně který druh mapy mít',
    description: 'Při rozdělení obrazovky možnost výběru, zda chci mít LiDAR na levé nebo pravé straně a optic na druhé straně.',
    votes: 0,
    votedBy: [],
    authorId: 'system',
    authorName: 'eArcheo',
    createdAt: Date.now(),
    status: 'new'
  }
];

export const TopFeatureRequests = () => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);

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
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/' }
      });
      return;
    }
    
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

  const handleSeeAll = () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/features' }
      });
    } else {
      navigate('/features');
    }
  };

  // Get top 3 features sorted by votes
  const topFeatures = [...features]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

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
    <section className="relative z-10 max-w-4xl mx-auto px-8 py-16">
      {/* Section header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-full mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-white/60 font-mono text-xs tracking-wider uppercase">Nejžádanější funkce</span>
        </div>
        <h3 className="font-display text-3xl md:text-4xl text-white mb-3">
          Co chcete vidět dál?
        </h3>
        <p className="text-white/50 font-mono text-sm">
          Hlasujte o funkcích, které byste rádi viděli v eArcheo
        </p>
      </div>

      {/* Feature cards */}
      <div className="space-y-3 mb-6">
        {topFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className="group bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-all"
          >
            <div className="flex gap-4 items-center">
              {/* Rank badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="font-display text-primary text-sm">#{index + 1}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-white text-base truncate">{feature.title}</h4>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider flex-shrink-0",
                    getStatusColor(feature.status)
                  )}>
                    {getStatusLabel(feature.status)}
                  </span>
                </div>
                <p className="text-white/40 font-mono text-xs line-clamp-1">
                  {feature.description}
                </p>
              </div>

              {/* Vote button */}
              <button
                onClick={() => handleVote(feature.id)}
                disabled={!isAuthenticated}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all flex-shrink-0",
                  isAuthenticated && user?.sub && feature.votedBy.includes(user.sub)
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-white/5 border-white/10 text-white/60 hover:border-primary/30 hover:text-primary",
                  !isAuthenticated && "cursor-pointer hover:bg-primary/10"
                )}
                title={!isAuthenticated ? "Přihlaste se pro hlasování" : ""}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-mono text-sm font-bold">{feature.votes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="text-center">
        <button
          onClick={handleSeeAll}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-surface/60 hover:bg-surface/80 border border-white/10 hover:border-primary/30 rounded-xl text-white/70 hover:text-primary font-mono text-sm transition-all"
        >
          {isAuthenticated ? 'Zobrazit všechny návrhy' : 'Přihlásit se a navrhnout funkci'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

