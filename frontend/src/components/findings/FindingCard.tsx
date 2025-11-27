import { MapPin, Calendar, Package } from 'lucide-react';
import { BaseCard } from '../shared';
import type { Finding } from '../../types/database';

interface FindingCardProps {
  finding: Finding & {
    images?: Array<{ thumbnailUrl: string }>;
    equipment?: Array<{ name: string }>;
  };
  onClick?: () => void;
}

export const FindingCard = ({ finding, onClick }: FindingCardProps) => {
  const thumbnail = finding.images?.[0]?.thumbnailUrl;
  const formattedDate = new Date(finding.date).toLocaleDateString('cs-CZ');
  
  return (
    <BaseCard onClick={onClick} className="hover:scale-[1.02] cursor-pointer">
      <div className="flex gap-4">
        {/* Thumbnail - always shown */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-black/20">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={finding.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface">
              <Package className="w-8 h-8 text-white/20" />
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-white mb-2 truncate">
            {finding.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {finding.category && finding.category.split(',').map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-primary text-xs font-mono"
              >
                {cat.trim()}
              </span>
            ))}
            {!finding.isPublic && (
              <span className="text-xs text-white/40 font-mono">🔒 Soukromé</span>
            )}
          </div>
          
          <div className="space-y-1 text-xs text-white/60 font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{finding.latitude.toFixed(4)}, {finding.longitude.toFixed(4)}</span>
            </div>
          </div>
          
          {finding.equipment && finding.equipment.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-primary/70">
              <Package className="w-3 h-3" />
              <span className="font-mono">{finding.equipment[0].name}</span>
              {finding.equipment.length > 1 && (
                <span className="text-white/40">+{finding.equipment.length - 1}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

