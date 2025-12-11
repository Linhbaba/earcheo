import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import { categoryLabels, categoryColors, calculateReadingTime, type Article } from '../data/articles';
import { formatArticleDate } from '../utils/articleUtils';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  const readingTime = calculateReadingTime(article.content);
  const categoryStyle = categoryColors[article.category];

  if (featured) {
    return (
      <Link 
        to={`/magazin/${article.slug}`}
        className="group block relative overflow-hidden rounded-2xl border border-white/10 hover:border-primary/30 transition-all duration-300"
      >
        <div className="aspect-[21/9] relative">
          <img
            src={article.coverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} border`}>
              {categoryLabels[article.category]}
            </span>
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
            </div>
          </div>
          
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mb-3 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          
          <p className="text-white/60 font-mono text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
            {article.excerpt}
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime} min čtení</span>
            </div>
            <span className="text-primary font-mono text-sm group-hover:underline">
              Číst více →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/magazin/${article.slug}`}
      className="group block bg-surface/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 hover:bg-surface/60 transition-all duration-300"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={article.coverImage}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-mono ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} border backdrop-blur-sm`}>
          {categoryLabels[article.category]}
        </span>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-3 mb-2 text-white/40 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{readingTime} min</span>
          </div>
        </div>
        
        <h3 className="font-display text-lg text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-white/50 font-mono text-sm leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
};
