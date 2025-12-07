import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader, ChevronDown, ChevronUp, MapPin, Lock, Eye, Globe, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useFindings } from '../../hooks/useFindings';
import { useProfile } from '../../hooks/useProfile';
import { useCustomFields } from '../../hooks/useCustomFields';
import { ImageUploader } from './ImageUploader';
import { LocationPicker } from './LocationPicker';
import { FindingTypeSelector } from './FindingTypeSelector';
import { DynamicField } from './DynamicField';
import { CustomFieldInput } from '../customFields';
import { TagInput } from '../shared';
import { getCategoriesForCollectorTypes, getDefaultFindingType } from '../../utils/collectorPresets';
import { 
  getFieldsForSection, 
  FINDING_TYPE_META,
  type FindingType 
} from '../../utils/findingFieldsConfig';
import type { CreateFindingRequest, Finding, FindingVisibility } from '../../types/database';

interface FindingFormProps {
  finding?: Finding | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 'type' | 'form';

export const FindingForm = ({ finding, onClose, onSuccess }: FindingFormProps) => {
  const { createFinding, updateFinding, uploadImage } = useFindings({ autoFetch: false });
  const { profile } = useProfile();
  const { customFields } = useCustomFields();
  const [loading, setLoading] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const isEditing = !!finding;
  
  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>(isEditing ? 'form' : 'type');
  const [selectedType, setSelectedType] = useState<FindingType>(
    (finding?.findingType as FindingType) || 'GENERAL'
  );
  
  // Collapsible sections
  const [showIdentification, setShowIdentification] = useState(true);
  const [showSpecific, setShowSpecific] = useState(true);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(false);
  
  // Get suggested categories and default type based on user's collector types
  const suggestedCategories = getCategoriesForCollectorTypes(profile?.collectorTypes || []);
  const suggestedType = getDefaultFindingType(profile?.collectorTypes || []);
  
  // Form data - all possible fields
  const [formData, setFormData] = useState<Record<string, unknown>>({
    title: '',
    latitude: 50.0755,
    longitude: 14.4378,
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    findingType: 'GENERAL',
    visibility: 'PRIVATE' as FindingVisibility,
    isPublic: false,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Pre-fill form when editing
  useEffect(() => {
    if (finding) {
      const categoryList = finding.category ? finding.category.split(',').map(c => c.trim()).filter(Boolean) : [];
      
      // Copy all finding fields to formData
      const data: Record<string, unknown> = {
        title: finding.title,
        latitude: finding.latitude,
        longitude: finding.longitude,
        date: new Date(finding.date).toISOString().split('T')[0],
        description: finding.description,
        category: finding.category,
        findingType: finding.findingType || 'GENERAL',
        visibility: finding.visibility || (finding.isPublic ? 'PUBLIC' : 'PRIVATE'),
        isPublic: finding.isPublic,
        // All extended fields
        condition: finding.condition || '',
        depth: finding.depth || undefined,
        locationName: finding.locationName || '',
        historicalContext: finding.historicalContext || '',
        material: finding.material || '',
        period: finding.period || '',
        periodFrom: finding.periodFrom || undefined,
        periodTo: finding.periodTo || undefined,
        dimensions: finding.dimensions || '',
        weight: finding.weight || undefined,
        coinItemType: finding.coinItemType || '',
        denomination: finding.denomination || '',
        mintYear: finding.mintYear || undefined,
        mint: finding.mint || '',
        catalogNumber: finding.catalogNumber || '',
        pickNumber: finding.pickNumber || '',
        grade: finding.grade || '',
        series: finding.series || '',
        emission: finding.emission || '',
        prefix: finding.prefix || '',
        signature: finding.signature || '',
        securityFeatures: finding.securityFeatures || '',
        stampYear: finding.stampYear || undefined,
        stampCatalogNumber: finding.stampCatalogNumber || '',
        pofisNumber: finding.pofisNumber || '',
        michelNumber: finding.michelNumber || '',
        stampItemType: finding.stampItemType || '',
        perforation: finding.perforation || '',
        printType: finding.printType || '',
        cancellation: finding.cancellation || '',
        paperType: finding.paperType || '',
        gumType: finding.gumType || '',
        watermark: finding.watermark || '',
        stampColor: finding.stampColor || '',
        army: finding.army || '',
        conflict: finding.conflict || '',
        unit: finding.unit || '',
        authenticity: finding.authenticity || '',
        detectorSignal: finding.detectorSignal || '',
        landType: finding.landType || '',
        soilConditions: finding.soilConditions || '',
        stratigraphy: finding.stratigraphy || '',
        context: finding.context || '',
        excavationMethod: finding.excavationMethod || '',
        interpretation: finding.interpretation || '',
        findingSituation: finding.findingSituation || '',
        origin: finding.origin || '',
        acquisitionMethod: finding.acquisitionMethod || '',
        estimatedValue: finding.estimatedValue || '',
        storageLocation: finding.storageLocation || '',
      };
      
      setFormData(data);
      setCategories(categoryList);
      setSelectedType((finding.findingType as FindingType) || 'GENERAL');
      
      // Load custom field values
      if (finding.customFieldValues) {
        const cfValues: Record<string, string> = {};
        finding.customFieldValues.forEach(cfv => {
          cfValues[cfv.customFieldId] = cfv.value;
        });
        setCustomFieldValues(cfValues);
      }
    }
  }, [finding]);
  
  // Handle type selection in wizard
  const handleTypeSelect = (type: FindingType) => {
    setSelectedType(type);
    setFormData(prev => ({ ...prev, findingType: type }));
    setWizardStep('form');
  };

  // Handle dynamic field change
  const handleFieldChange = (key: string, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle custom field change
  const handleCustomFieldChange = (customFieldId: string, value: string) => {
    setCustomFieldValues(prev => ({ ...prev, [customFieldId]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (categories.length === 0) {
      toast.error('Přidejte alespoň jednu kategorii');
      return;
    }
    
    setLoading(true);
    
    try {
      const categoryString = categories.join(', ');
      
      // Prepare data
      const dataToSend: CreateFindingRequest = {
        title: formData.title as string,
        latitude: formData.latitude as number,
        longitude: formData.longitude as number,
        date: new Date(formData.date as string).toISOString(),
        description: formData.description as string,
        category: categoryString,
        findingType: selectedType,
        visibility: formData.visibility as FindingVisibility,
        isPublic: formData.visibility === 'PUBLIC',
      };

      // Add all non-empty optional fields
      const optionalFields = [
        'condition', 'depth', 'locationName', 'historicalContext', 'material',
        'period', 'periodFrom', 'periodTo', 'dimensions', 'weight',
        'coinItemType', 'denomination', 'mintYear', 'mint', 'catalogNumber', 'pickNumber', 'grade',
        'series', 'emission', 'prefix', 'signature', 'securityFeatures',
        'stampYear', 'stampCatalogNumber', 'pofisNumber', 'michelNumber', 'stampItemType',
        'perforation', 'printType', 'cancellation', 'paperType', 'gumType', 'watermark', 'stampColor',
        'army', 'conflict', 'unit', 'authenticity',
        'detectorSignal', 'landType', 'soilConditions', 'stratigraphy', 'context', 'excavationMethod', 'interpretation', 'findingSituation',
        'origin', 'acquisitionMethod', 'estimatedValue', 'storageLocation'
      ];

      optionalFields.forEach(field => {
        const value = formData[field];
        if (value !== undefined && value !== null && value !== '') {
          (dataToSend as unknown as Record<string, unknown>)[field] = value;
        }
      });

      // Add custom field values
      const cfValuesArray = Object.entries(customFieldValues)
        .filter(([_, value]) => value !== '')
        .map(([customFieldId, value]) => ({ customFieldId, value }));
      
      if (cfValuesArray.length > 0) {
        dataToSend.customFieldValues = cfValuesArray;
      }
      
      let savedFinding;
      
      if (isEditing && finding) {
        savedFinding = await updateFinding(finding.id, dataToSend);
        toast.success('Nález byl úspěšně aktualizován!');
      } else {
        savedFinding = await createFinding(dataToSend);
        toast.success('Nález byl úspěšně přidán!');
      }
      
      // Upload pending images
      if (!isEditing && pendingImages.length > 0 && savedFinding?.id) {
        toast.info(`Nahrávám ${pendingImages.length} ${pendingImages.length === 1 ? 'fotku' : pendingImages.length < 5 ? 'fotky' : 'fotek'}...`);
        
        for (const file of pendingImages) {
          try {
            await uploadImage(savedFinding.id, file);
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
        
        toast.success('Fotky byly nahrány!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Submit finding error:', error);
      toast.error(isEditing ? 'Chyba při aktualizaci nálezu' : 'Chyba při vytváření nálezu');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhotos = async (files: File[]) => {
    if (isEditing && finding) {
      for (const file of files) {
        await uploadImage(finding.id, file);
      }
      setShowImageUploader(false);
    } else {
      setPendingImages(prev => [...prev, ...files]);
      setShowImageUploader(false);
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectLocation = (latitude: number, longitude: number) => {
    setFormData(prev => ({ ...prev, latitude, longitude }));
  };

  // Get fields for current type
  const identificationFields = getFieldsForSection(selectedType, 'identification');
  const specificFields = getFieldsForSection(selectedType, 'specific');
  const provenanceFields = getFieldsForSection(selectedType, 'provenance');
  const typeMeta = FINDING_TYPE_META[selectedType];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-primary/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {wizardStep === 'form' && !isEditing && (
              <button
                onClick={() => setWizardStep('type')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/50" />
              </button>
            )}
            <h2 className="font-display text-2xl text-primary">
              {isEditing ? 'Upravit nález' : wizardStep === 'type' ? 'Nový nález' : `Nový nález · ${typeMeta.label.split(' / ')[0]}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        
        {/* Wizard Step 1: Type Selection */}
        {wizardStep === 'type' && (
          <FindingTypeSelector
            selectedType={null}
            onSelect={handleTypeSelect}
            suggestedType={suggestedType}
          />
        )}

        {/* Wizard Step 2: Form */}
        {wizardStep === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* === ZÁKLADNÍ INFORMACE === */}
            <div className="space-y-4">
              {/* Název */}
              <div>
                <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                  Název nálezu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title as string}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="např. Římská mince"
                />
              </div>
              
              {/* Kategorie */}
              <div>
                <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                  Kategorie *
                </label>
                <TagInput
                  tags={categories}
                  onChange={setCategories}
                  suggestions={suggestedCategories}
                  placeholder="např. Mince, Střelivo..."
                  maxTags={3}
                  disabled={loading}
                />
              </div>
              
              {/* Datum */}
              <div>
                <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                  Datum nálezu *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date as string}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              
              {/* GPS souřadnice */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs text-white/70 font-mono uppercase tracking-wider">
                    Poloha *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-xs text-primary hover:text-primary/80 font-mono transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Vybrat na mapě
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-1">Latitude</label>
                    <input
                      type="number"
                      required
                      step="0.000001"
                      value={formData.latitude as number}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 font-mono mb-1">Longitude</label>
                    <input
                      type="number"
                      required
                      step="0.000001"
                      value={formData.longitude as number}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Popis */}
              <div>
                <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                  Popis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description as string}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  placeholder="Podrobný popis nálezu..."
                />
              </div>
              
              {/* Visibility */}
              <div>
                <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                  Viditelnost *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'PRIVATE' })}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      formData.visibility === 'PRIVATE'
                        ? "bg-red-500/10 border-red-500/50 text-red-400"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                    )}
                  >
                    <Lock className="w-5 h-5" />
                    <div className="text-center">
                      <div className="text-xs font-bold font-mono mb-0.5">Privátní</div>
                      <div className="text-[10px] opacity-60 leading-tight">Pouze pro mě</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'ANONYMOUS' })}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      formData.visibility === 'ANONYMOUS'
                        ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                    )}
                  >
                    <Eye className="w-5 h-5" />
                    <div className="text-center">
                      <div className="text-xs font-bold font-mono mb-0.5">Anonymní</div>
                      <div className="text-[10px] opacity-60 leading-tight">Veřejné bez jména</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'PUBLIC' })}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      formData.visibility === 'PUBLIC'
                        ? "bg-green-500/10 border-green-500/50 text-green-400"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                    )}
                  >
                    <Globe className="w-5 h-5" />
                    <div className="text-center">
                      <div className="text-xs font-bold font-mono mb-0.5">Veřejné</div>
                      <div className="text-[10px] opacity-60 leading-tight">Veřejné se jménem</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* === IDENTIFIKACE PŘEDMĚTU === */}
            {identificationFields.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIdentification(!showIdentification)}
                  className="flex items-center justify-between w-full text-left group mb-4"
                >
                  <span className="text-sm text-white/70 font-mono uppercase tracking-wider group-hover:text-primary transition-colors">
                    Identifikace předmětu
                  </span>
                  {showIdentification ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                  )}
                </button>

                {showIdentification && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    {identificationFields.map(field => (
                      <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <DynamicField
                          field={field}
                          value={formData[field.key] as string | number | null}
                          onChange={handleFieldChange}
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === SPECIFICKÁ POLE PRO TYP === */}
            {specificFields.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSpecific(!showSpecific)}
                  className="flex items-center justify-between w-full text-left group mb-4"
                >
                  <span className={`text-sm font-mono uppercase tracking-wider group-hover:text-primary transition-colors ${typeMeta.color.text}`}>
                    {typeMeta.label.split(' / ')[0]} · Specifická pole
                  </span>
                  {showSpecific ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                  )}
                </button>

                {showSpecific && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    {specificFields.map(field => (
                      <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <DynamicField
                          field={field}
                          value={formData[field.key] as string | number | null}
                          onChange={handleFieldChange}
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === PROVENIENCE === */}
            {provenanceFields.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProvenance(!showProvenance)}
                  className="flex items-center justify-between w-full text-left group mb-4"
                >
                  <span className="text-sm text-white/70 font-mono uppercase tracking-wider group-hover:text-primary transition-colors">
                    Provenience a sbírka
                  </span>
                  {showProvenance ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                  )}
                </button>

                {showProvenance && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    {provenanceFields.map(field => (
                      <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <DynamicField
                          field={field}
                          value={formData[field.key] as string | number | null}
                          onChange={handleFieldChange}
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === VLASTNÍ POLE === */}
            {customFields.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomFields(!showCustomFields)}
                  className="flex items-center justify-between w-full text-left group mb-4"
                >
                  <span className="text-sm text-white/70 font-mono uppercase tracking-wider group-hover:text-primary transition-colors">
                    Vlastní pole ({customFields.length})
                  </span>
                  {showCustomFields ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                  )}
                </button>

                {showCustomFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    {customFields.map(field => (
                      <CustomFieldInput
                        key={field.id}
                        field={field}
                        value={customFieldValues[field.id] || ''}
                        onChange={handleCustomFieldChange}
                        disabled={loading}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === FOTOGRAFIE === */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs text-white/70 font-mono uppercase tracking-wider">
                  Fotografie (volitelné)
                </label>
                {!showImageUploader && (
                  <button
                    type="button"
                    onClick={() => setShowImageUploader(true)}
                    className="text-xs text-primary hover:text-primary/80 font-mono transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Přidat fotky
                  </button>
                )}
              </div>

              {!isEditing && pendingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-white/50 font-mono mb-2">
                    {pendingImages.length} {pendingImages.length === 1 ? 'fotka' : pendingImages.length < 5 ? 'fotky' : 'fotek'} připraveno
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {pendingImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20 group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePendingImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showImageUploader && (
                <div className="space-y-3">
                  <ImageUploader onUpload={handleUploadPhotos} />
                  <button
                    type="button"
                    onClick={() => setShowImageUploader(false)}
                    className="text-xs text-white/50 hover:text-white/70 font-mono transition-colors"
                  >
                    Zrušit
                  </button>
                </div>
              )}
              
              {!isEditing && !showImageUploader && pendingImages.length === 0 && (
                <p className="text-xs text-white/40 font-mono">
                  Fotky můžete přidat nyní nebo později
                </p>
              )}
            </div>
            
            {/* === ACTIONS === */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 font-mono text-sm transition-colors"
                disabled={loading}
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Ukládám...
                  </>
                ) : (
                  isEditing ? 'Uložit změny' : 'Přidat nález'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleSelectLocation}
        initialLatitude={formData.latitude as number}
        initialLongitude={formData.longitude as number}
      />
    </div>
  );
};
