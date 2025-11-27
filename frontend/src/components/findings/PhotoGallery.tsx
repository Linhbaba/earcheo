import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2, Loader } from 'lucide-react';
import { clsx } from 'clsx';
import type { FindingImage } from '../../types/database';

interface PhotoGalleryProps {
  images: FindingImage[];
  onDelete?: (imageId: string) => Promise<void>;
  canDelete?: boolean;
}

export const PhotoGallery = ({ images, onDelete, canDelete = false }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close lightbox on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      switch (e.key) {
        case 'Escape':
          setSelectedIndex(null);
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => 
      prev === null || prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(prev => 
      prev === null || prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDelete = async () => {
    if (!onDelete || selectedIndex === null || deleting) return;

    const imageToDelete = images[selectedIndex];
    setDeleting(true);

    try {
      await onDelete(imageToDelete.id);
      
      // Close lightbox if it was last image, or move to next
      if (images.length === 1) {
        setSelectedIndex(null);
      } else if (selectedIndex >= images.length - 1) {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      }
    } catch (error) {
      console.error('Delete image error:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-surface/40 rounded-lg border border-white/10">
        <p className="text-white/50 font-mono text-sm">Žádné fotky</p>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20 hover:border-primary/30 transition-all group"
          >
            <img
              src={image.thumbnailUrl}
              alt={`Fotka ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/50" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Delete button */}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="absolute top-4 right-20 z-10 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <Loader className="w-6 h-6 text-red-400 animate-spin" />
              ) : (
                <Trash2 className="w-6 h-6 text-red-400" />
              )}
            </button>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 rounded-lg border border-white/20">
            <p className="text-white font-mono text-sm">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Image */}
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].mediumUrl}
              alt={`Fotka ${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
            />
          </div>

          {/* Swipe indicators on mobile */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-all',
                    index === selectedIndex
                      ? 'bg-primary w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

