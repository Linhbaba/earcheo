import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Clock, Calendar, Share2, Copy, Check, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArticleRenderer } from '../components/ArticleRenderer';
import { ArticleCard } from '../components/ArticleCard';
import { NotFoundPage } from './NotFoundPage';
import { 
  getArticleBySlug, 
  getRelatedArticles, 
  calculateReadingTime,
  categoryLabels,
  categoryColors
} from '../data/articles';
import { 
  formatArticleDate, 
  formatDateISO, 
  getFullArticleUrl, 
  copyToClipboard, 
  shareArticle, 
  canShare 
} from '../utils/articleUtils';

export const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  
  const article = slug ? getArticleBySlug(slug) : undefined;
  
  if (!article) {
    return <NotFoundPage />;
  }

  const relatedArticles = getRelatedArticles(article.slug, 3);
  const readingTime = calculateReadingTime(article.content);
  const categoryStyle = categoryColors[article.category];
  const fullUrl = getFullArticleUrl(article.slug);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(fullUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shared = await shareArticle(article.title, fullUrl);
    if (!shared) {
      handleCopyLink();
    }
  };

  // JSON-LD structured data for article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: formatDateISO(article.publishedAt),
    dateModified: formatDateISO(article.publishedAt),
    author: {
      '@type': 'Organization',
      name: 'eArcheo',
      url: 'https://earcheo.cz',
    },
    publisher: {
      '@type': 'Organization',
      name: 'eArcheo',
      logo: {
        '@type': 'ImageObject',
        url: 'https://earcheo.cz/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
  };

  return (
    <>
      <SEOHead
        title={`${article.title} | eArcheo Magazín`}
        description={article.excerpt}
        keywords={`${article.focusKeyword}, ${categoryLabels[article.category]}, numismatika, archeologie`}
        canonicalUrl={`/magazin/${article.slug}`}
        ogType="article"
        ogImage={article.coverImage}
      />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main id="main-content">
          {/* Hero Header */}
          <header className="relative">
            <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] relative overflow-hidden">
              <img
                src={article.coverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Breadcrumb */}
                <nav 
                  className="flex items-center gap-2 text-sm font-mono text-white/50 mb-4"
                  aria-label="Breadcrumb"
                >
                  <Link to="/" className="hover:text-white transition-colors">Domů</Link>
                  <ChevronRight className="w-4 h-4" />
                  <Link to="/magazin" className="hover:text-white transition-colors">Magazín</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-white/70 truncate max-w-[200px]">{article.title}</span>
                </nav>

                {/* Category & Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-mono ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} border`}>
                    {categoryLabels[article.category]}
                  </span>
                  <div className="flex items-center gap-1.5 text-white/50 text-sm font-mono">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-sm font-mono">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} min čtení</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                  {article.title}
                </h1>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
              {/* Article Content */}
              <article className="min-w-0">
                <ArticleRenderer content={article.content} />
                
                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-white/50 font-mono text-sm">Sdílet článek:</span>
                    
                    {canShare() && (
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-surface/60 border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 font-mono text-sm transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                        Sdílet
                      </button>
                    )}
                    
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2 bg-surface/60 border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 font-mono text-sm transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Zkopírováno!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Kopírovat odkaz
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Back Link */}
                <div className="mt-8">
                  <Link 
                    to="/magazin"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-mono text-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Zpět na magazín
                  </Link>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-8">
                  {/* CTA */}
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                    <h3 className="font-display text-lg text-white mb-2">
                      Objevujte s námi
                    </h3>
                    <p className="text-white/50 font-mono text-sm mb-4">
                      Zaregistrujte se a získejte přístup k interaktivní mapě s LiDAR daty.
                    </p>
                    <Link
                      to="/"
                      className="block w-full px-4 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-primary font-mono text-sm text-center transition-all"
                    >
                      Vyzkoušet zdarma
                    </Link>
                  </div>

                  {/* Related Articles */}
                  {relatedArticles.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg text-white mb-4">
                        Související články
                      </h3>
                      <div className="space-y-4">
                        {relatedArticles.map((related) => (
                          <Link
                            key={related.id}
                            to={`/magazin/${related.slug}`}
                            className="block p-3 bg-surface/40 border border-white/10 rounded-xl hover:border-primary/30 transition-all group"
                          >
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono mb-2 ${categoryColors[related.category].bg} ${categoryColors[related.category].text}`}>
                              {categoryLabels[related.category]}
                            </span>
                            <h4 className="font-display text-sm text-white group-hover:text-primary transition-colors line-clamp-2">
                              {related.title}
                            </h4>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>

            {/* Mobile Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="lg:hidden mt-12 pt-8 border-t border-white/10">
                <h2 className="font-display text-xl text-white mb-6">
                  Další články
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedArticles.slice(0, 2).map((related) => (
                    <ArticleCard key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};
