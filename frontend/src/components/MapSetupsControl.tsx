import { useState, useRef, useEffect } from 'react';
import { Bookmark, X, Save, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth0 } from '@auth0/auth0-react';
import { useMapSetups } from '../hooks/useMapSetups';
import type { MapSetupConfig, MapSetup } from '../types/database';

interface MapSetupsControlProps {
  currentConfig: MapSetupConfig;
  onLoadSetup: (config: MapSetupConfig) => void;
}

export const MapSetupsControl = ({ currentConfig, onLoadSetup }: MapSetupsControlProps) => {
  const { isAuthenticated } = useAuth0();
  const { setups, loading, createSetup, deleteSetup } = useMapSetups();
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const handleSave = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      await createSetup(newName.trim(), currentConfig);
      setNewName('');
    } catch {
      // Error handled in hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(id);
    try {
      await deleteSetup(id);
    } catch {
      // Error handled in hook
    } finally {
      setDeleting(null);
    }
  };

  const handleLoad = (setup: MapSetup) => {
    onLoadSetup(setup.config);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        title="Uložené pohledy"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-1.5 rounded-lg transition-colors bg-black/40",
          isOpen || setups.length > 0
            ? "text-amber-400"
            : "text-white/50 hover:text-white hover:bg-white/10"
        )}
      >
        <Bookmark className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-surface/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10">
            <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">
              Uložené pohledy
            </span>
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
              </div>
            ) : setups.length === 0 ? (
              <div className="py-4 text-center text-xs text-white/30">
                Zatím žádné uložené
              </div>
            ) : (
              setups.map((setup) => (
                <button
                  key={setup.id}
                  onClick={() => handleLoad(setup)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                  <span className="text-sm text-white/80 truncate pr-2">
                    {setup.name}
                  </span>
                  <button
                    onClick={(e) => handleDelete(setup.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                    disabled={deleting === setup.id}
                  >
                    {deleting === setup.id ? (
                      <Loader2 className="w-3 h-3 text-white/50 animate-spin" />
                    ) : (
                      <X className="w-3 h-3 text-white/50 hover:text-red-400" />
                    )}
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Save new */}
          <div className="px-3 py-2 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Název..."
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
              maxLength={30}
            />
            <button
              onClick={handleSave}
              disabled={!newName.trim() || saving}
              className={clsx(
                "p-1.5 rounded-lg transition-colors",
                newName.trim() && !saving
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-white/5 text-white/30"
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

