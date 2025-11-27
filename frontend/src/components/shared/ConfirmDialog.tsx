import { X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Potvrdit',
  cancelLabel = 'Zrušit',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-400',
      button: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400',
    },
    warning: {
      icon: 'text-amber-400',
      button: 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-400',
    },
    info: {
      icon: 'text-primary',
      button: 'bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-surface/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-xl pointer-events-none" />
        
        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={clsx('p-2 rounded-lg bg-white/5', style.icon)}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-display text-lg text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-white/70 font-mono">
                {message}
              </p>
            </div>
            
            {!loading && (
              <button
                onClick={onCancel}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                'flex-1 px-4 py-2.5 border rounded-lg font-mono text-sm transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                style.button
              )}
            >
              {loading ? 'Načítání...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

