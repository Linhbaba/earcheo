import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArticleCard } from '../components/ArticleCard';
import { 
  articles, 
  getFeaturedArticle, 
  categoryLabels, 
  categoryColors,
  type ArticleCategory 
} from '../data/articles';

type FilterCategory = 'all' | ArticleCategory;

export const MagazinPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const featured = getFeaturedArticle();
  
  const filteredArticles = activeFilter === 'all' 
    ? articles.slice(1) // Exclude featured
    : articles.filter(a => a.category === activeFilter && a.id !== featured.id);

  const filters: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'Vše' },
    { value: 'numismatika', label: categoryLabels.numismatika },
    { value: 'archeologie', label: categoryLabels.archeologie },
    { value: 'historie', label: categoryLabels.historie },
  ];

  return (
    <>
      <SEOHead
        title="Magazín"
        description="Příběhy o nálezech mincí, pokladů a artefaktů. Numismatika, archeologie a historie pro sběratele a badatele."
        keywords="numismatika, archeologie, mince, poklady, historie, nálezy, detektoring"
        canonicalUrl="/magazin"
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl text-white">Magazín</h1>
                <p className="text-white/50 font-mono text-sm">Příběhy z historie a archeologie</p>
              </div>
            </div>
          </div>

          {/* Featured Article */}
          <section className="mb-12" aria-label="Hlavní článek">
            <ArticleCard article={featured} featured />
          </section>

          {/* Filter Tabs */}
          <div className="mb-8">
            <nav 
              className="flex flex-wrap gap-2" 
              role="tablist" 
              aria-label="Filtrovat podle kategorie"
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter.value;
                const colorStyle = filter.value !== 'all' 
                  ? categoryColors[filter.value as ArticleCategory] 
                  : null;
                
                return (
                  <button
                    key={filter.value}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`
                      px-4 py-2 rounded-lg font-mono text-sm transition-all
                      ${isActive 
                        ? colorStyle 
                          ? `${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} border`
                          : 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-surface/40 text-white/60 border border-white/10 hover:text-white hover:border-white/20'
                      }
                    `}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Articles Grid */}
          <section aria-label="Seznam článků">
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-white/50 font-mono">
                  V této kategorii zatím nejsou žádné články.
                </p>
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="mt-16 p-8 bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl text-center">
            <h2 className="font-display text-2xl text-white mb-3">
              Sledujte novinky
            </h2>
            <p className="text-white/50 font-mono text-sm mb-6 max-w-md mx-auto">
              Připravujeme další články o zajímavých nálezech a historických objevech.
            </p>
            <a
              href="mailto:ahoj@earcheo.cz"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-primary font-mono text-sm transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
            >
              Kontaktujte nás
            </a>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};
