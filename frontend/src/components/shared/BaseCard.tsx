import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface BaseCardProps {
  children: ReactNode;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BaseCard = ({ children, glow = false, className = '', onClick }: BaseCardProps) => {
  return (
    <div 
      className={clsx(
        'relative bg-surface/80 backdrop-blur-md',
        'border border-white/10 rounded-xl p-6',
        'hover:border-primary/30 transition-all',
        glow && 'shadow-lg shadow-primary/10',
        onClick && 'cursor-pointer hover:bg-surface/90',
        className
      )}
      onClick={onClick}
    >
      {/* Corner decorations - Sci-fi style */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg pointer-events-none" />
      
      {children}
    </div>
  );
};

