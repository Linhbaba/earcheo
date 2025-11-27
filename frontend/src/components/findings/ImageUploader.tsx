import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ImageUploader = ({ 
  onUpload, 
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false 
}: ImageUploaderProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Nepodporovaný formát (pouze JPG, PNG, WEBP)`);
      return false;
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`${file.name}: Příliš velký soubor (max ${maxSizeMB}MB)`);
      return false;
    }

    return true;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files
    if (images.length + fileArray.length > maxFiles) {
      toast.error(`Můžete nahrát maximálně ${maxFiles} fotek`);
      return;
    }

    // Validate and create previews
    const validFiles: ImageFile[] = [];
    fileArray.forEach(file => {
      if (validateFile(file)) {
        const imageFile: ImageFile = {
          id: Math.random().toString(36).substring(7),
          file,
          preview: URL.createObjectURL(file),
        };
        validFiles.push(imageFile);
      }
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemove = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleUpload = async () => {
    if (images.length === 0) return;

    setUploading(true);
    try {
      const files = images.map(img => img.file);
      await onUpload(files);
      
      // Clean up
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      
      toast.success(`${files.length} ${files.length === 1 ? 'fotka nahrána' : 'fotky nahrány'}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Chyba při nahrávání fotek');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          isDragging && !disabled
            ? 'border-primary/70 bg-primary/10'
            : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
        
        <p className="font-mono text-sm text-white/70 mb-2">
          {isDragging ? 'Pusťte fotky zde' : 'Přetáhněte fotky nebo klikněte'}
        </p>
        
        <p className="font-mono text-xs text-white/40">
          Max {maxFiles} fotek, {maxSizeMB}MB každá • JPG, PNG, WEBP
        </p>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map(image => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/20"
              >
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(image.id);
                    }}
                    disabled={uploading}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white/70 font-mono truncate">
                    {image.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || disabled}
            className="w-full px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Nahrávám {images.length} {images.length === 1 ? 'fotku' : 'fotek'}...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Nahrát {images.length} {images.length === 1 ? 'fotku' : 'fotek'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

