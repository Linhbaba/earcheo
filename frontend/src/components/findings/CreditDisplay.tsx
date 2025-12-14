import { Coins, Loader } from 'lucide-react';
import clsx from 'clsx';

interface CreditDisplayProps {
  balance: number;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}

export const CreditDisplay = ({
  balance,
  loading = false,
  compact = false,
  className,
}: CreditDisplayProps) => {
  if (loading) {
    return (
      <div className={clsx(
        'flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg',
        className
      )}>
        <Loader className="w-4 h-4 text-white/50 animate-spin" />
        {!compact && <span className="text-xs text-white/50 font-mono">Načítám...</span>}
      </div>
    );
  }

  const isLow = balance < 10;
  const isEmpty = balance === 0;

  return (
    <div className={clsx(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
      isEmpty
        ? 'bg-red-500/10 border-red-500/30'
        : isLow
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-primary/10 border-primary/30',
      className
    )}>
      <Coins className={clsx(
        'w-4 h-4',
        isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-primary'
      )} />
      <span className={clsx(
        'font-mono text-sm font-medium',
        isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-primary'
      )}>
        {balance}
      </span>
      {!compact && (
        <span className="text-white/40 text-xs">
          {balance === 1 ? 'kredit' : balance < 5 ? 'kredity' : 'kreditů'}
        </span>
      )}
    </div>
  );
};

