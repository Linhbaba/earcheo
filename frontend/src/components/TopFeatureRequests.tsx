import { useAuth0 } from '@auth0/auth0-react';
import { ThumbsUp, TrendingUp, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category?: string; // Optional because old data might not have it
  votes: number;
  userVoted: boolean;
  userId: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const TopFeatureRequests = () => {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch features from API (public endpoint - no auth required)
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        
        // Try to get token if authenticated
        let headers: HeadersInit = {};
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently();
            headers = { 'Authorization': `Bearer ${token}` };
          } catch (_err) {
            // User not authenticated, continue without token
          }
        }

        const response = await fetch(`${API_URL}/api/features`, { headers });
        
        if (response.ok) {
          const data = await response.json();
          setFeatures(data);
        }
      } catch (error) {
        console.error('Failed to fetch features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleVote = async (featureId: string) => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/' }
      });
      return;
    }
    
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/api/features/${featureId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle vote');
      }

      const updated = await response.json();
      
      // Update feature in list
      setFeatures(prev => prev.map(f => f.id === featureId ? updated : f));
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Nepodařilo se hlasovat');
    }
  };

  const handleSeeAll = () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/' }
      });
    } else {
      // Open feature requests modal or navigate
      window.location.href = '/map'; // User can then open feature requests from menu
    }
  };

  // Get top 3 features sorted by votes
  const topFeatures = [...features]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

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
    <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      {/* Section header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-surface/60 backdrop-blur-sm border border-white/10 rounded-full mb-3 sm:mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-white/60 font-mono text-[10px] sm:text-xs tracking-wider uppercase">Nejžádanější funkce</span>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-white mb-2 sm:mb-3 px-4">
          Co chcete vidět dál?
        </h3>
        <p className="text-white/50 font-mono text-xs sm:text-sm px-4">
          Hlasujte o funkcích, které byste rádi viděli v eArcheo
        </p>
      </div>

      {/* Feature cards */}
      <div className="space-y-3 mb-6">
        {loading ? (
          <div className="text-center text-white/30 font-mono text-sm py-8">
            Načítání návrhů...
          </div>
        ) : topFeatures.length === 0 ? (
          <div className="text-center text-white/30 font-mono text-sm py-8">
            Zatím žádné návrhy funkcí
          </div>
        ) : (
          topFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className="group bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex gap-2 sm:gap-4 items-center">
                {/* Rank badge */}
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="font-display text-primary text-xs sm:text-sm">#{index + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <h4 className="font-display text-white text-sm sm:text-base truncate">{feature.title}</h4>
                    {feature.category && (
                      <span className={clsx(
                        "px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono uppercase tracking-wider flex-shrink-0",
                        getCategoryColor(feature.category)
                      )}>
                        {feature.category}
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 font-mono text-[10px] sm:text-xs line-clamp-1">
                    {feature.description}
                  </p>
                </div>

                {/* Vote button */}
                <button
                  onClick={() => handleVote(feature.id)}
                  disabled={!isAuthenticated}
                  className={clsx(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all flex-shrink-0",
                    isAuthenticated && feature.userVoted
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-primary/30 hover:text-primary",
                    !isAuthenticated && "cursor-pointer hover:bg-primary/10"
                  )}
                  title={!isAuthenticated ? "Přihlaste se pro hlasování" : ""}
                >
                  <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-mono text-xs sm:text-sm font-bold">{feature.votes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call to action */}
      <div className="text-center px-4">
        <button
          onClick={handleSeeAll}
          className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-surface/60 hover:bg-surface/80 border border-white/10 hover:border-primary/30 rounded-xl text-white/70 hover:text-primary font-mono text-xs sm:text-sm transition-all"
        >
          <span className="hidden sm:inline">{isAuthenticated ? 'Zobrazit všechny návrhy' : 'Přihlásit se a navrhnout funkci'}</span>
          <span className="sm:hidden">{isAuthenticated ? 'Všechny návrhy' : 'Navrhnout funkci'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

