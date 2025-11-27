import { clsx } from 'clsx';

interface StatusBadgeProps {
  type: 'DETECTOR' | 'GPS' | 'OTHER' | 'coins' | 'tools' | 'pottery' | 'jewelry' | 'weapons' | string;
  label: string;
  color?: 'amber' | 'blue' | 'gray' | 'yellow' | 'orange' | 'purple' | 'red'; // Optional override
}

export const StatusBadge = ({ type, label, color }: StatusBadgeProps) => {
  // Statický mapping pro Tailwind JIT compiler
  const styles: Record<string, string> = {
    // Equipment types
    DETECTOR: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    GPS: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    OTHER: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    // Finding categories
    coins: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    tools: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    pottery: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    jewelry: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    weapons: 'bg-red-500/20 border-red-500/30 text-red-400',
    // Color overrides
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
  };
  
  const styleKey = color || type;
  
  return (
    <span className={clsx(
      'inline-flex px-3 py-1 rounded-lg border text-xs font-mono tracking-wider uppercase',
      styles[styleKey] || styles.OTHER
    )}>
      {label}
    </span>
  );
};

