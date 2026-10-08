import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string | null) => void;
  currentUrl?: string | null;
  label?: string;
  error?: string;
  hint?: string;
}

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUpload({ onUpload, currentUrl, label = 'Item Image', error, hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Only JPG, PNG, WebP, and GIF images are allowed.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setLocalError('Image must be smaller than 2 MB.');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 data URL for local storage
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });

      setPreview(dataUrl);
      onUpload(dataUrl);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="label">{label}</label>
      <div
        className="relative border-2 border-dashed rounded-lg transition-colors"
        style={{
          borderColor: (error || localError) ? 'var(--color-error)' : 'var(--color-border-dark)',
          backgroundColor: 'var(--color-surface-alt)',
        }}
      >
        {preview ? (
          <div className="relative group">
            <img src={preview} alt="Item preview" className="w-full h-48 object-contain rounded-lg" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-48 text-center p-4"
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Processing...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Click to upload an image
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  JPG, PNG, WebP, or GIF (max 2 MB)
                </span>
              </div>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          aria-label={label}
        />
      </div>
      {(error || localError) ? (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
          {localError || error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>
      ) : null}
    </div>
  );
}
