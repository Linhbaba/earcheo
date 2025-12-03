import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader, ChevronDown, ChevronUp, MapPin, Lock, Eye, Globe } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useFindings } from '../../hooks/useFindings';
import { ImageUploader } from './ImageUploader';
import { LocationPicker } from './LocationPicker';
import { TagInput } from '../shared';
import type { CreateFindingRequest, Finding, FindingVisibility } from '../../types/database';

interface FindingFormProps {
  finding?: Finding | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FindingForm = ({ finding, onClose, onSuccess }: FindingFormProps) => {
  const { createFinding, updateFinding, uploadImage } = useFindings({ autoFetch: false });
  const [loading, setLoading] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const isEditing = !!finding;
  
  const [formData, setFormData] = useState<CreateFindingRequest & {
    condition?: string;
    depth?: number;
    material?: string;
    historicalContext?: string;
    locationName?: string;
    visibility: FindingVisibility;
  }>({
    title: '',
    latitude: 50.0755, // Default Praha
    longitude: 14.4378,
    date: new Date().toISOString().split('T')[0], // Today
    description: '',
    category: '',
    visibility: 'PRIVATE',
    isPublic: false,
    // Extended fields
    condition: '',
    depth: undefined,
    material: '',
    historicalContext: '',
    locationName: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (finding) {
      // Parse categories from comma-separated string
      const categoryList = finding.category ? finding.category.split(',').map(c => c.trim()).filter(Boolean) : [];
      
      setFormData({
        title: finding.title,
        latitude: finding.latitude,
        longitude: finding.longitude,
        date: new Date(finding.date).toISOString().split('T')[0],
        description: finding.description,
        category: finding.category,
        visibility: finding.visibility || (finding.isPublic ? 'PUBLIC' : 'PRIVATE'),
        isPublic: finding.isPublic, // Legacy sync
        condition: finding.condition || '',
        depth: finding.depth || undefined,
        material: finding.material || '',
        historicalContext: finding.historicalContext || '',
        locationName: finding.locationName || '',
      });
      
      setCategories(categoryList);
      
      // Show extended if any field is filled
      if (finding.condition || finding.depth || finding.material || finding.historicalContext || finding.locationName) {
        setShowExtended(true);
      }
    }
  }, [finding]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate categories
    if (categories.length === 0) {
      toast.error('Přidejte alespoň jednu kategorii');
      return;
    }
    
    setLoading(true);
    
    try {
      // Join categories with comma
      const categoryString = categories.join(', ');
      
      // Prepare data with extended fields
      const dataToSend: Record<string, unknown> = {};
      
      dataToSend.title = formData.title;
      dataToSend.latitude = formData.latitude;
      dataToSend.longitude = formData.longitude;
      dataToSend.date = new Date(formData.date).toISOString();
      dataToSend.description = formData.description;
      dataToSend.category = categoryString;
      dataToSend.visibility = formData.visibility;
      dataToSend.isPublic = formData.visibility === 'PUBLIC'; // Sync legacy

      // Add extended fields if provided
      if (formData.condition) dataToSend.condition = formData.condition;
      if (formData.depth) dataToSend.depth = formData.depth;
      if (formData.material) dataToSend.material = formData.material;
      if (formData.historicalContext) dataToSend.historicalContext = formData.historicalContext;
      if (formData.locationName) dataToSend.locationName = formData.locationName;
      
      let savedFinding;
      
      if (isEditing && finding) {
        savedFinding = await updateFinding(finding.id, dataToSend as unknown as CreateFindingRequest);
        toast.success('Nález byl úspěšně aktualizován!');
      } else {
        savedFinding = await createFinding(dataToSend as unknown as CreateFindingRequest);
        toast.success('Nález byl úspěšně přidán!');
      }
      
      // Upload pending images if any (only for new findings)
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
      // Edit mode - upload immediately
      for (const file of files) {
        await uploadImage(finding.id, file);
      }
      setShowImageUploader(false);
    } else {
      // Create mode - store for later upload
      setPendingImages(prev => [...prev, ...files]);
      setShowImageUploader(false);
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectLocation = (latitude: number, longitude: number) => {
    setFormData({ ...formData, latitude, longitude });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-primary/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-primary">
            {isEditing ? 'Upravit nález' : 'Přidat nález'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Název */}
          <div>
            <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
              Název nálezu *
            </label>
            <input
              type="text"
              required
              value={formData.title}
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
              value={formData.date}
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
                <label className="block text-xs text-white/40 font-mono mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  required
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 font-mono mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  required
                  step="0.000001"
                  value={formData.longitude}
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
              rows={4}
              value={formData.description}
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
              {/* Private */}
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

              {/* Anonymous */}
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

              {/* Public */}
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

          {/* Extended fields (collapsible) */}
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowExtended(!showExtended)}
              className="flex items-center justify-between w-full text-left group mb-4"
            >
              <span className="text-sm text-white/70 font-mono uppercase tracking-wider group-hover:text-primary transition-colors">
                Rozšířené informace (volitelné)
              </span>
              {showExtended ? (
                <ChevronUp className="w-4 h-4 text-primary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
              )}
            </button>

            {showExtended && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Location name */}
                <div>
                  <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                    Název lokality
                  </label>
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="např. Karlštejn, u hradu"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                    Stav nálezu
                  </label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="např. dobrý, poškozený, korozi..."
                  />
                </div>

                {/* Depth */}
                <div>
                  <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                    Hloubka nálezu (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.depth || ''}
                    onChange={(e) => setFormData({ ...formData, depth: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="např. 15.5"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                    Materiál
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="např. stříbro, bronz, keramika..."
                  />
                </div>

                {/* Historical context */}
                <div>
                  <label className="block text-xs text-white/70 font-mono uppercase tracking-wider mb-2">
                    Historický kontext
                  </label>
                  <textarea
                    rows={3}
                    value={formData.historicalContext}
                    onChange={(e) => setFormData({ ...formData, historicalContext: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    placeholder="Historické souvislosti, období, zajímavosti..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Photo upload */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs text-white/70 font-mono uppercase tracking-wider">
                Fotografie (volitelné)
              </label>
              {!showImageUploader && (
                <button
                  type="button"
                  onClick={() => setShowImageUploader(true)}
                  className="text-xs text-primary hover:text-primary/80 font-mono transition-colors"
                >
                  + Přidat fotky
                </button>
              )}
            </div>

            {/* Pending images preview (create mode) */}
            {!isEditing && pendingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-white/50 font-mono mb-2">
                  {pendingImages.length} {pendingImages.length === 1 ? 'fotka' : pendingImages.length < 5 ? 'fotky' : 'fotek'} připraveno k nahrání
                </p>
                <div className="grid grid-cols-3 gap-2">
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
                Fotky můžete přidat nyní nebo později po vytvoření nálezu
              </p>
            )}
          </div>
          
          {/* Actions */}
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
      </div>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleSelectLocation}
        initialLatitude={formData.latitude}
        initialLongitude={formData.longitude}
      />
    </div>
  );
};

