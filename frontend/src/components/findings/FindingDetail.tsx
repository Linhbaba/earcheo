import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Edit, Trash2, ChevronDown, ChevronUp, Package, Lock, Eye, Globe, Bot, Loader, Sparkles, ChevronLeft, ChevronRight, Plus, ImageIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
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
import type { Finding, FindingImage } from '../../types/database';

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
  
  // Hero gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

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

  // Reset image index when images change
  useEffect(() => {
    if (currentImageIndex >= finding.images.length) {
      setCurrentImageIndex(Math.max(0, finding.images.length - 1));
    }
  }, [finding.images.length]);

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

  const handleDeleteImage = async (image: FindingImage) => {
    setDeletingImage(true);
    try {
      await deleteImage(finding.id, image.id);
      toast.success('Fotka smazána');
      setLightboxOpen(false);
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error('Chyba při mazání fotky');
    } finally {
      setDeletingImage(false);
    }
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

  const navigateImage = (direction: 'prev' | 'next') => {
    if (finding.images.length <= 1) return;
    setCurrentImageIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? finding.images.length - 1 : prev - 1;
      }
      return prev === finding.images.length - 1 ? 0 : prev + 1;
    });
  };

  // Get type icon
  const TypeIcon = Icons[typeMeta.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
  const currentImage = finding.images[currentImageIndex];

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal - Single Column Article Style */}
        <div className="relative bg-surface/95 backdrop-blur-md border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-2xl pointer-events-none z-10" />
          
          {/* Content with scroll */}
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Hero Image Section */}
            <div className="relative">
              {/* Featured Image */}
              <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                {finding.images.length > 0 && currentImage ? (
                  <>
                    <img
                      src={currentImage.mediumUrl}
                      alt={finding.title}
                      className="absolute inset-0 w-full h-full object-contain bg-black/60 cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                    />
                    
                    {/* Navigation arrows */}
                    {finding.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full border border-white/20 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full border border-white/20 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                    
                    {/* Image counter */}
                    {finding.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 rounded-full border border-white/20">
                        <p className="text-white font-mono text-xs">
                          {currentImageIndex + 1} / {finding.images.length}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                    <ImageIcon className="w-16 h-16 mb-3" />
                    <p className="font-mono text-sm">Žádné fotky</p>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full border border-white/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  {/* Type badge */}
                  <div className={`w-9 h-9 rounded-lg ${typeMeta.color.bg} ${typeMeta.color.border} border flex items-center justify-center`}>
                    {TypeIcon && <TypeIcon className={`w-4 h-4 ${typeMeta.color.text}`} />}
                  </div>
                  <span className={`text-xs font-mono ${typeMeta.color.text}`}>
                    {typeMeta.label}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-white leading-tight">
                  {finding.title}
                </h2>
              </div>
            </div>

            {/* Thumbnail strip */}
            {finding.images.length > 1 && (
              <div className="px-6 py-3 border-b border-white/10 bg-surface/50">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20">
                  {finding.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={clsx(
                        'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all',
                        index === currentImageIndex
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-white/10 hover:border-white/30'
                      )}
                    >
                      <img
                        src={image.thumbnailUrl}
                        alt={`Fotka ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  
                  {/* Add photo button */}
                  <button
                    onClick={() => setShowUploader(true)}
                    className="flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/50 bg-primary/5 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 text-primary/70" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <div className="p-6 space-y-6">
              {/* Add photos if no images */}
              {finding.images.length === 0 && !showUploader && (
                <button
                  onClick={() => setShowUploader(true)}
                  className="w-full px-4 py-4 bg-primary/5 hover:bg-primary/10 border border-dashed border-primary/30 rounded-xl text-primary font-mono text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Přidat fotky
                </button>
              )}
              
              {/* Single add button when has images but strip not shown */}
              {finding.images.length === 1 && !showUploader && (
                <button
                  onClick={() => setShowUploader(true)}
                  className="w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg text-primary font-mono text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Přidat další fotky
                </button>
              )}

              {/* Image uploader */}
              {showUploader && (
                <div className="border border-primary/20 rounded-xl p-4 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-white/70 font-mono">Nahrát nové fotky</p>
                    <button
                      onClick={() => setShowUploader(false)}
                      className="text-xs text-white/50 hover:text-white/70 font-mono"
                    >
                      Zrušit
                    </button>
                  </div>
                  <ImageUploader onUpload={handleUploadPhotos} />
                </div>
              )}
              
              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                  <MapPin className="w-4 h-4 text-primary/70" />
                  <span>{finding.latitude.toFixed(6)}, {finding.longitude.toFixed(6)}</span>
                </div>
                {/* Visibility badge */}
                {visibility === 'PRIVATE' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400">
                    <Lock className="w-3 h-3" />
                    Soukromý
                  </span>
                )}
                {visibility === 'ANONYMOUS' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    <Eye className="w-3 h-3" />
                    Anonymní
                  </span>
                )}
                {visibility === 'PUBLIC' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-green-500/10 border border-green-500/20 text-green-400">
                    <Globe className="w-3 h-3" />
                    Veřejný
                  </span>
                )}
              </div>
              
              {/* Categories */}
              {finding.category && (
                <div className="flex flex-wrap gap-2">
                  {finding.category.split(',').map((cat, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex px-3 py-1.5 rounded-lg border bg-primary/10 border-primary/30 text-primary text-sm font-mono"
                    >
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Description */}
              {finding.description && (
                <div>
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                    {finding.description}
                  </p>
                </div>
              )}

              {/* Location name */}
              {finding.locationName && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70">{finding.locationName}</p>
                </div>
              )}

              {/* Equipment */}
              {finding.equipment && finding.equipment.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs text-white/50 uppercase tracking-wider">
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

              {/* Collapsible sections */}
              <div className="space-y-4 pt-2">
                {/* Identification fields */}
                {hasIdentificationData && (
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowIdentification(!showIdentification)}
                      className="flex items-center justify-between w-full text-left p-4 bg-white/5 hover:bg-white/[0.07] transition-colors"
                    >
                      <h3 className="font-mono text-sm text-white/70 uppercase tracking-wider">
                        Identifikace předmětu
                      </h3>
                      {showIdentification ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </button>

                    {showIdentification && (
                      <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
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
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowSpecific(!showSpecific)}
                      className="flex items-center justify-between w-full text-left p-4 bg-white/5 hover:bg-white/[0.07] transition-colors"
                    >
                      <h3 className={`font-mono text-sm uppercase tracking-wider ${typeMeta.color.text}`}>
                        {typeMeta.label.split(' / ')[0]} · Specifické
                      </h3>
                      {showSpecific ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </button>

                    {showSpecific && (
                      <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
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
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowProvenance(!showProvenance)}
                      className="flex items-center justify-between w-full text-left p-4 bg-white/5 hover:bg-white/[0.07] transition-colors"
                    >
                      <h3 className="font-mono text-sm text-white/70 uppercase tracking-wider">
                        Provenience a sbírka
                      </h3>
                      {showProvenance ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </button>

                    {showProvenance && (
                      <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
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
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowCustomFields(!showCustomFields)}
                      className="flex items-center justify-between w-full text-left p-4 bg-white/5 hover:bg-white/[0.07] transition-colors"
                    >
                      <h3 className="font-mono text-sm text-white/70 uppercase tracking-wider">
                        Vlastní pole ({finding.customFieldValues.length})
                      </h3>
                      {showCustomFields ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/50" />
                      )}
                    </button>

                    {showCustomFields && (
                      <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
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
                <div className="border border-purple-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                    className="flex items-center justify-between w-full text-left p-4 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                  >
                    <h3 className="font-mono text-sm text-purple-400 uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI Analýza
                    </h3>
                    {showAIAnalysis ? (
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/50" />
                    )}
                  </button>

                  {showAIAnalysis && (
                    <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Historie analýz */}
                      {(finding as unknown as { analyses?: Array<{ level: string; createdAt: string }> }).analyses && 
                       (finding as unknown as { analyses?: Array<{ level: string; createdAt: string }> }).analyses!.length > 0 ? (
                        <div className="space-y-2">
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
                        <p className="text-xs text-white/40">Zatím žádné analýzy</p>
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

            {/* Footer actions */}
            <div className="sticky bottom-0 border-t border-white/10 px-6 py-4 bg-surface/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
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
                      Upravit
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
      </div>

      {/* Lightbox for full image view */}
      {lightboxOpen && currentImage && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteImage(currentImage);
            }}
            disabled={deletingImage}
            className="absolute top-4 right-20 z-10 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
          >
            {deletingImage ? (
              <Loader className="w-6 h-6 text-red-400 animate-spin" />
            ) : (
              <Trash2 className="w-6 h-6 text-red-400" />
            )}
          </button>

          {/* Image counter */}
          {finding.images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 rounded-lg border border-white/20">
              <p className="text-white font-mono text-sm">
                {currentImageIndex + 1} / {finding.images.length}
              </p>
            </div>
          )}

          {/* Navigation */}
          {finding.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Full image */}
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage.mediumUrl}
              alt={finding.title}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Dots indicator */}
          {finding.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {finding.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentImageIndex
                      ? 'bg-primary w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
