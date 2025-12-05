import { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, MapPin, Calendar, Edit, Loader, Coins, Target, Medal, Check } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useProfile } from '../../hooks/useProfile';
import { useFindings } from '../../hooks/useFindings';
import { useEquipment } from '../../hooks/useEquipment';
import { LoadingSkeleton } from '../shared';
import { 
  COLLECTOR_TYPE_LABELS, 
  COLLECTOR_TYPE_DESCRIPTIONS, 
  COLLECTOR_TYPE_COLORS 
} from '../../utils/collectorPresets';
import type { CollectorType } from '../../types/database';

// Ikony pro typy sběratelů
const CollectorIcons: Record<CollectorType, React.ReactNode> = {
  NUMISMATIST: <Coins className="w-5 h-5" />,
  PHILATELIST: <Mail className="w-5 h-5" />,
  MILITARIA: <Medal className="w-5 h-5" />,
  DETECTORIST: <Target className="w-5 h-5" />,
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { profile, loading: profileLoading, updateProfile, fetchProfile } = useProfile();
  const { findings, loading: findingsLoading, fetchFindings } = useFindings();
  const { equipment, loading: equipmentLoading, fetchEquipment } = useEquipment();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nickname: profile?.nickname || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    contact: profile?.contact || '',
  });
  const [selectedCollectorTypes, setSelectedCollectorTypes] = useState<CollectorType[]>(
    profile?.collectorTypes || []
  );
  
  // Sync collector types when profile loads
  useEffect(() => {
    if (profile?.collectorTypes) {
      setSelectedCollectorTypes(profile.collectorTypes);
    }
  }, [profile?.collectorTypes]);
  
  const toggleCollectorType = (type: CollectorType) => {
    setSelectedCollectorTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Refresh data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Only fetch if not already loading to prevent race conditions
      if (!profileLoading) fetchProfile();
      if (!findingsLoading) fetchFindings();
      if (!equipmentLoading) fetchEquipment();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loading = profileLoading || findingsLoading || equipmentLoading;

  // Stats
  const totalFindings = findings?.length || 0;
  const publicFindings = findings?.filter(f => f.isPublic).length || 0;
  const totalEquipment = equipment?.length || 0;
  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })
    : '-';

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        nickname: formData.nickname || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        contact: formData.contact || undefined,
        collectorTypes: selectedCollectorTypes,
      });
      toast.success('Profil byl aktualizován');
      setIsEditing(false);
      // Refresh profile to get updated data
      await fetchProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Chyba při aktualizaci profilu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nickname: profile?.nickname || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      contact: profile?.contact || '',
    });
    setSelectedCollectorTypes(profile?.collectorTypes || []);
    setIsEditing(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-3xl max-h-[85vh] bg-surface/95 backdrop-blur-md border border-primary/30 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="relative border-b border-white/10 px-5 py-3">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl tracking-wider text-primary">
                  Profil
                </h2>
                <p className="text-white/50 font-mono text-xs mt-1">
                  Vaše informace a statistiky
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-xs tracking-wider transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Upravit
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Zavřít"
                >
                  <X className="w-5 h-5 text-white/70 hover:text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-5 py-4">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      {profile?.avatarUrl ? (
                        <img 
                          src={profile.avatarUrl} 
                          alt={profile.nickname || profile.email}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-10 h-10 text-primary" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-white/50 font-mono uppercase mb-1">
                              Přezdívka
                            </label>
                            <input
                              type="text"
                              value={formData.nickname}
                              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                              placeholder="Vaše přezdívka"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 font-mono uppercase mb-1">
                              Lokalita
                            </label>
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                              placeholder="např. Praha, ČR"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 font-mono uppercase mb-1">
                              Kontakt
                            </label>
                            <input
                              type="text"
                              value={formData.contact}
                              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                              placeholder="Tel. nebo jiný kontakt"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 font-mono uppercase mb-1">
                              O mně
                            </label>
                            <textarea
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 resize-none"
                              placeholder="Krátký popis o vás..."
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={handleCancel}
                              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 font-mono text-sm transition-colors"
                              disabled={saving}
                            >
                              Zrušit
                            </button>
                            <button
                              onClick={handleSave}
                              className="flex-1 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Ukládám...
                                </>
                              ) : (
                                'Uložit'
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h3 className="font-display text-xl text-white">
                            {profile?.nickname || 'Archeolog'}
                          </h3>
                          <div className="flex items-center gap-2 text-white/50 font-mono text-xs">
                            <Mail className="w-3 h-3" />
                            <span>{profile?.email}</span>
                          </div>
                          {profile?.location && (
                            <div className="flex items-center gap-2 text-white/50 font-mono text-xs">
                              <MapPin className="w-3 h-3" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile?.contact && (
                            <div className="flex items-center gap-2 text-white/50 font-mono text-xs">
                              <span>📞 {profile.contact}</span>
                            </div>
                          )}
                          {profile?.bio && (
                            <p className="text-white/70 text-sm mt-3">{profile.bio}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collector Types Section */}
                <div className="bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider mb-4">
                    🎯 Moje zaměření
                  </h3>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(Object.keys(COLLECTOR_TYPE_LABELS) as CollectorType[]).map((type) => {
                        const isSelected = selectedCollectorTypes.includes(type);
                        const colors = COLLECTOR_TYPE_COLORS[type];
                        
                        return (
                          <button
                            key={type}
                            onClick={() => toggleCollectorType(type)}
                            className={clsx(
                              "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left",
                              isSelected
                                ? `${colors.bg} ${colors.border}`
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                            )}
                          >
                            {/* Checkbox */}
                            <div className={clsx(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                              isSelected ? `${colors.bg} ${colors.border}` : "border-white/20"
                            )}>
                              {isSelected && <Check className={`w-3 h-3 ${colors.text}`} />}
                            </div>
                            
                            {/* Icon */}
                            <div className={clsx(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              isSelected ? `${colors.bg} ${colors.border} border` : "bg-white/10"
                            )}>
                              <span className={isSelected ? colors.text : 'text-white/50'}>
                                {CollectorIcons[type]}
                              </span>
                            </div>
                            
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className={clsx(
                                "font-medium text-sm transition-colors",
                                isSelected ? colors.text : "text-white"
                              )}>
                                {COLLECTOR_TYPE_LABELS[type]}
                              </div>
                              <div className="text-white/40 text-xs truncate">
                                {COLLECTOR_TYPE_DESCRIPTIONS[type]}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      {profile?.collectorTypes && profile.collectorTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.collectorTypes.map((type) => {
                            const colors = COLLECTOR_TYPE_COLORS[type];
                            return (
                              <div
                                key={type}
                                className={clsx(
                                  "flex items-center gap-2 px-3 py-2 rounded-xl border",
                                  colors.bg, colors.border
                                )}
                              >
                                <span className={colors.text}>{CollectorIcons[type]}</span>
                                <span className={`font-mono text-sm ${colors.text}`}>
                                  {COLLECTOR_TYPE_LABELS[type]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-white/40 text-sm font-mono text-center py-4">
                          Zatím nemáte vybrané žádné zaměření.
                          <br />
                          <span className="text-white/30">Klikněte na "Upravit" pro nastavení.</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Statistics */}
                <div className="bg-surface/40 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider mb-4">
                    📊 Statistiky
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-display text-primary">{totalFindings}</div>
                      <div className="text-xs text-white/50 font-mono uppercase mt-1">Celkem nálezů</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-display text-green-400">{publicFindings}</div>
                      <div className="text-xs text-white/50 font-mono uppercase mt-1">Veřejných</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-display text-amber-400">{totalEquipment}</div>
                      <div className="text-xs text-white/50 font-mono uppercase mt-1">Vybavení</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-white/60 mb-1">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-white/50 font-mono">{memberSince}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom corner decorations */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-xl" />
        </div>
      </div>
    </>
  );
};

