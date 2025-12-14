import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Edit, Trash2, ChevronDown, ChevronUp, Package, Lock, Eye, Globe, Bot, Loader, Sparkles } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { PhotoGallery } from './PhotoGallery';
import { ImageUploader } from './ImageUploader';
import { DynamicFieldDisplay } from './DynamicField';
import { CustomFieldDisplay } from '../customFields';
import { ConfirmDialog } from '../shared';
import { useFindings } from '../../hooks/useFindings';
import { useCredits } from '../../hooks/useCredits';
import { 
  getFieldsForSection, 
  FINDING_TYPE_META,
  type FindingType 
} from '../../utils/findingFieldsConfig';
import type { Finding } from '../../types/database';

interface FindingDetailProps {
  finding: Finding;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const FindingDetail = ({ finding: initialFinding, onClose, onEdit, onDelete }: FindingDetailProps) => {
  const { findings, uploadImage, deleteImage, deleteFinding } = useFindings();
  const { balance: userCredits } = useCredits();
  const [showIdentification, setShowIdentification] = useState(true);
  const [showSpecific, setShowSpecific] = useState(true);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [_showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [analyzing, _setAnalyzing] = useState(false);

  // Use live finding data from findings array (updates after image upload)
  const finding = findings.find(f => f.id === initialFinding.id) || initialFinding;
  
  // Determine visibility with legacy fallback
  const visibility = finding.visibility || (finding.isPublic ? 'PUBLIC' : 'PRIVATE');
  const findingType = (finding.findingType || 'GENERAL') as FindingType;
  const typeMeta = FINDING_TYPE_META[findingType];

  // Get fields for this finding type
  const identificationFields = getFieldsForSection(findingType, 'identification');
  const specificFields = getFieldsForSection(findingType, 'specific');
  const provenanceFields = getFieldsForSection(findingType, 'provenance');

  // Check which sections have data
  const findingRecord = finding as unknown as Record<string, unknown>;
  
  const hasIdentificationData = identificationFields.some(f => {
    const value = findingRecord[f.key];
    return value !== null && value !== undefined && value !== '';
  });

  const hasSpecificData = specificFields.some(f => {
    const value = findingRecord[f.key];
    return value !== null && value !== undefined && value !== '';
  });

  const hasProvenanceData = provenanceFields.some(f => {
    const value = findingRecord[f.key];
    return value !== null && value !== undefined && value !== '';
  });

  const hasCustomFieldData = finding.customFieldValues && finding.customFieldValues.length > 0;

  useEffect(() => {
    // Auto-expand sections with data
    if (hasIdentificationData) setShowIdentification(true);
    if (hasSpecificData) setShowSpecific(true);
    if (hasProvenanceData) setShowProvenance(true);
    if (hasCustomFieldData) setShowCustomFields(true);
  }, [finding]);

  const formattedDate = new Date(finding.date).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleUploadPhotos = async (files: File[]) => {
    for (const file of files) {
      await uploadImage(finding.id, file);
    }
    setShowUploader(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    await deleteImage(finding.id, imageId);
    toast.success('Fotka smazána');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFinding(finding.id);
      toast.success('Nález byl smazán');
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Delete finding error:', error);
      toast.error('Chyba při mazání nálezu');
    } finally {
      setDeleting(false);
    }
  };

  // Get type icon
  const TypeIcon = Icons[typeMeta.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-surface/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-2xl pointer-events-none" />
          
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Type badge */}
                <div className={`w-10 h-10 rounded-xl ${typeMeta.color.bg} ${typeMeta.color.border} border flex items-center justify-center`}>
                  {TypeIcon && <TypeIcon className={`w-5 h-5 ${typeMeta.color.text}`} />}
                </div>
                <div>
                  <h2 className="font-display text-2xl text-primary tracking-wider">
                    {finding.title}
                  </h2>
                  <p className={`text-xs font-mono ${typeMeta.color.text}`}>
                    {typeMeta.label}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white/70" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Photos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider">
                    Fotografie
                  </h3>
                  {finding.images.length > 0 && (
                    <span className="text-xs text-white/40 font-mono">
                      {finding.images.length} {finding.images.length === 1 ? 'fotka' : finding.images.length < 5 ? 'fotky' : 'fotek'}
                    </span>
                  )}
                </div>
                
                <PhotoGallery
                  images={finding.images}
                  onDelete={handleDeleteImage}
                  canDelete={true}
                />

                {!showUploader && (
                  <button
                    onClick={() => setShowUploader(true)}
                    className="w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all"
                  >
                    + Přidat fotky
                  </button>
                )}

                {showUploader && (
                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-white/70 font-mono uppercase">Nahrát nové fotky</p>
                      <button
                        onClick={() => setShowUploader(false)}
                        className="text-xs text-white/50 hover:text-white/70 font-mono"
                      >
                        Zrušit
                      </button>
                    </div>
                    <ImageUploader onUpload={handleUploadPhotos} />
                    <p className="mt-3 text-xs text-primary/70 font-mono flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                      Fotky se ukládají automaticky
                    </p>
                  </div>
                )}
              </div>

              {/* Right column - Info */}
              <div className="space-y-6">
                {/* Basic info */}
                <div className="space-y-4">
                  <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider">
                    Základní informace
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-primary/70 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-white/50 font-mono uppercase">Datum nálezu</p>
                        <p className="text-white font-mono">{formattedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary/70 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-white/50 font-mono uppercase">GPS Souřadnice</p>
                        <p className="text-white font-mono">
                          {finding.latitude.toFixed(6)}, {finding.longitude.toFixed(6)}
                        </p>
                        {finding.locationName && (
                          <p className="text-sm text-white/70 mt-1">{finding.locationName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-white/50 font-mono uppercase mb-2">Kategorie</p>
                      <div className="flex flex-wrap gap-2">
                        {finding.category && finding.category.split(',').map((cat, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex px-3 py-1.5 rounded-lg border bg-primary/10 border-primary/30 text-primary text-sm font-mono"
                          >
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-white/50 font-mono uppercase mb-2">Popis</p>
                      <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                        {finding.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-white/50 font-mono uppercase mb-2">Viditelnost</p>
                      <div className="flex items-center gap-2">
                        {visibility === 'PRIVATE' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-mono bg-red-500/10 border border-red-500/30 text-red-400">
                            <Lock className="w-3.5 h-3.5" />
                            Soukromý
                          </span>
                        )}
                        {visibility === 'ANONYMOUS' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                            <Eye className="w-3.5 h-3.5" />
                            Anonymní
                          </span>
                        )}
                        {visibility === 'PUBLIC' && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-mono bg-green-500/10 border border-green-500/30 text-green-400">
                            <Globe className="w-3.5 h-3.5" />
                            Veřejný
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                {finding.equipment && finding.equipment.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider">
                      Použité vybavení
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {finding.equipment.map((eq) => (
                        <div
                          key={eq.id}
                          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <Package className="w-4 h-4 text-primary/70" />
                          <span className="text-sm text-white/80 font-mono">{eq.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Identification fields */}
                {hasIdentificationData && (
                  <div className="border-t border-white/10 pt-6">
                    <button
                      onClick={() => setShowIdentification(!showIdentification)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Identifikace předmětu
                      </h3>
                      {showIdentification ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                      )}
                    </button>

                    {showIdentification && (
                      <div className="mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                        {identificationFields.map(field => (
                          <DynamicFieldDisplay
                            key={field.key}
                            field={field}
                            value={findingRecord[field.key] as string | number | null}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Type-specific fields */}
                {hasSpecificData && (
                  <div className="border-t border-white/10 pt-6">
                    <button
                      onClick={() => setShowSpecific(!showSpecific)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <h3 className={`font-mono text-xs uppercase tracking-wider group-hover:text-primary transition-colors ${typeMeta.color.text}`}>
                        {typeMeta.label.split(' / ')[0]} · Specifické
                      </h3>
                      {showSpecific ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                      )}
                    </button>

                    {showSpecific && (
                      <div className="mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                        {specificFields.map(field => (
                          <DynamicFieldDisplay
                            key={field.key}
                            field={field}
                            value={findingRecord[field.key] as string | number | null}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Provenance fields */}
                {hasProvenanceData && (
                  <div className="border-t border-white/10 pt-6">
                    <button
                      onClick={() => setShowProvenance(!showProvenance)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Provenience a sbírka
                      </h3>
                      {showProvenance ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                      )}
                    </button>

                    {showProvenance && (
                      <div className="mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                        {provenanceFields.map(field => (
                          <DynamicFieldDisplay
                            key={field.key}
                            field={field}
                            value={findingRecord[field.key] as string | number | null}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom fields */}
                {hasCustomFieldData && finding.customFieldValues && (
                  <div className="border-t border-white/10 pt-6">
                    <button
                      onClick={() => setShowCustomFields(!showCustomFields)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <h3 className="font-mono text-xs text-white/70 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Vlastní pole ({finding.customFieldValues.length})
                      </h3>
                      {showCustomFields ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                      )}
                    </button>

                    {showCustomFields && (
                      <div className="mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                        {finding.customFieldValues.map(cfv => (
                          cfv.customField && (
                            <CustomFieldDisplay
                              key={cfv.id}
                              field={cfv.customField}
                              value={cfv.value}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Analysis section */}
                <div className="border-t border-white/10 pt-6">
                  <button
                    onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <h3 className="font-mono text-xs text-purple-400 uppercase tracking-wider group-hover:text-purple-300 transition-colors flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI Analýza
                    </h3>
                    {showAIAnalysis ? (
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-purple-400 transition-colors" />
                    )}
                  </button>

                  {showAIAnalysis && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Historie analýz */}
                      {(finding as unknown as { analyses?: Array<{ level: string; createdAt: string }> }).analyses && 
                       (finding as unknown as { analyses?: Array<{ level: string; createdAt: string }> }).analyses!.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          <p className="text-xs text-white/50 font-mono">Historie analýz:</p>
                          {(finding as unknown as { analyses: Array<{ level: string; createdAt: string }> }).analyses.slice(0, 3).map((analysis, idx) => (
                            <div 
                              key={idx}
                              className="p-2 bg-white/5 rounded-lg text-xs"
                            >
                              <div className="flex justify-between">
                                <span className="text-purple-400">
                                  {analysis.level === 'quick' ? '⚡ Rychlá' : 
                                   analysis.level === 'detailed' ? '🔍 Detailní' : '🎓 Expertní'}
                                </span>
                                <span className="text-white/40">
                                  {new Date(analysis.createdAt).toLocaleDateString('cs')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 mb-4">Zatím žádné analýzy</p>
                      )}
                      
                      <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-white/70">
                            Nech AI analyzovat fotografie a vyplnit pole.
                          </p>
                          <span className="text-xs text-purple-400 font-mono">
                            🪙 {userCredits} kreditů
                          </span>
                        </div>
                        
                        {finding.images.length === 0 ? (
                          <p className="text-xs text-amber-400">
                            ⚠️ Pro AI analýzu je potřeba přidat alespoň jednu fotku
                          </p>
                        ) : (
                          <button
                            onClick={() => setShowAnalyzeModal(true)}
                            disabled={analyzing || userCredits < 1}
                            className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {analyzing ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Analyzuji...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Spustit AI analýzu
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-white/10 px-6 py-4 bg-surface/50">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-white/40 font-mono">
                  Vytvořeno: {new Date(finding.createdAt).toLocaleDateString('cs-CZ')}
                </p>
                {finding.updatedAt !== finding.createdAt && (
                  <p className="text-xs text-white/30 font-mono">
                    Upraveno: {new Date(finding.updatedAt).toLocaleDateString('cs-CZ')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Upravit info
                  </button>
                )}
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-mono text-sm transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Smazat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Smazat nález?"
        message="Tato akce je nevratná. Všechny fotky budou také smazány."
        confirmLabel="Ano, smazat"
        cancelLabel="Zrušit"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </>
  );
};
