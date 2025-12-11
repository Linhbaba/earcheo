import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import type { Components } from 'react-markdown';

interface ArticleRendererProps {
  content: string;
}

// Lightbox component
const Lightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <div 
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
    onClick={onClose}
  >
    <button 
      onClick={onClose}
      className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      aria-label="Zavřít"
    >
      <X className="w-8 h-8" />
    </button>
    <img
      src={src}
      alt={alt}
      className="max-w-full max-h-[90vh] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

// Remove first H1 from content (it's already shown in hero)
const removeFirstH1 = (content: string): string => {
  const lines = content.split('\n');
  let foundH1 = false;
  const filteredLines = lines.filter(line => {
    if (!foundH1 && line.trim().startsWith('# ')) {
      foundH1 = true;
      return false; // Skip this line
    }
    return true;
  });
  return filteredLines.join('\n');
};

export const ArticleRenderer = ({ content }: ArticleRendererProps) => {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  
  // Process content to remove first H1
  const processedContent = useMemo(() => removeFirstH1(content), [content]);

  const components: Components = {
    // Custom link renderer - handle internal vs external links
    a: ({ href, children }) => {
      if (!href) return <>{children}</>;

      // Check if it's an internal link
      const isInternal = href.startsWith('/') || href.startsWith('./') || href.endsWith('.md');
      
      if (isInternal) {
        // Transform .md links to proper routes
        let internalHref = href;
        if (href.startsWith('./')) {
          internalHref = `/magazin/${href.slice(2).replace('.md', '')}`;
        } else if (href.endsWith('.md')) {
          internalHref = `/magazin/${href.replace('.md', '')}`;
        }
        
        return (
          <Link 
            to={internalHref}
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {children}
          </Link>
        );
      }
      
      // External link - inline with small icon
      return (
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          {children}<sup className="text-[10px] ml-0.5 no-underline">↗</sup>
        </a>
      );
    },
    
    // Custom image renderer with lightbox
    img: ({ src, alt }) => (
      <figure className="my-8">
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          onClick={() => src && setLightboxImage({ src, alt: alt || '' })}
          className="w-full rounded-xl border border-white/10 cursor-zoom-in hover:border-white/20 transition-colors"
        />
        {alt && (
          <figcaption className="mt-2 text-center text-sm text-white/50 font-mono">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    
    h1: ({ children }) => (
      <h1 className="font-display text-3xl sm:text-4xl text-white mb-6 mt-8">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl sm:text-3xl text-white mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl sm:text-2xl text-white mb-3 mt-6">
        {children}
      </h3>
    ),
    
    // Paragraphs
    p: ({ children }) => (
      <p className="text-white/70 leading-relaxed mb-4">
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-white/70">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-white/70">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-white/70">
        {children}
      </li>
    ),
    
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 my-6 text-white/60 italic">
        {children}
      </blockquote>
    ),
    
    // Emphasis (italics used for intro paragraph)
    em: ({ children }) => (
      <em className="text-white/80 not-italic font-medium">
        {children}
      </em>
    ),
    
    // Strong
    strong: ({ children }) => (
      <strong className="text-white font-semibold">
        {children}
      </strong>
    ),
    
    // Code
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 bg-surface rounded text-primary font-mono text-sm">
        {children}
      </code>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="my-8 border-white/10" />
    ),
  };

  return (
    <>
      <article className="prose-custom">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {processedContent}
        </ReactMarkdown>
      </article>
      
      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox 
          src={lightboxImage.src} 
          alt={lightboxImage.alt} 
          onClose={() => setLightboxImage(null)} 
        />
      )}
    </>
  );
};
