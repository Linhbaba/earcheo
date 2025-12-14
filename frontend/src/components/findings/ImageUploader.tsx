import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, Loader } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

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
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Removed images state - files are uploaded immediately

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

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files
    if (fileArray.length > maxFiles) {
      toast.error(`Můžete nahrát maximálně ${maxFiles} fotek najednou`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    fileArray.forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    // Ihned nahrát soubory (automaticky bez tlačítka)
    if (validFiles.length > 0) {
      setUploading(true);
      try {
        await onUpload(validFiles);
        toast.success(`${validFiles.length} ${validFiles.length === 1 ? 'fotka přidána' : 'fotky přidány'}`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Chyba při přidávání fotek');
      } finally {
        setUploading(false);
      }
    }
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

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      className={clsx(
        'relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
        isDragging && !disabled
          ? 'border-primary/70 bg-primary/10'
          : 'border-primary/30 hover:border-primary/50 hover:bg-primary/5',
        (disabled || uploading) && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileInput}
        disabled={disabled || uploading}
        className="hidden"
      />

      {uploading ? (
        <>
          <Loader className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
          <p className="font-mono text-sm text-primary">Přidávám fotky...</p>
        </>
      ) : (
        <>
          <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="font-mono text-sm text-white/70 mb-1">
            {isDragging ? 'Pusťte fotky zde' : 'Přetáhněte fotky nebo klikněte'}
          </p>
          <p className="font-mono text-xs text-white/40">
            Max {maxFiles} fotek, {maxSizeMB}MB • JPG, PNG, WEBP
          </p>
        </>
      )}
    </div>
  );
};

