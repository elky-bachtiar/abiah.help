import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Camera, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button-bkp';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  previewUrl: string | null;
  isUploading: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onUpload: () => Promise<any>;
}

export function PhotoUpload({
  currentPhotoUrl,
  previewUrl,
  isUploading,
  error,
  onFileSelect,
  onClear,
  onUpload
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Use default image if none provided
  const displayUrl = previewUrl || currentPhotoUrl || '/images/Elky.jpeg';
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary mb-2">Profile Photo</h3>
        <p className="text-text-secondary text-sm mb-4">
          Upload a profile photo to personalize your account
        </p>
      </div>
      
      {/* Photo Preview */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100">
            <img 
              src={displayUrl} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {previewUrl && (
            <button
              onClick={onClear}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-white border border-neutral-200 text-text-secondary hover:text-error transition-colors"
              aria-label="Clear selected photo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm flex items-center"
        >
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Select Image
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>
        
        {previewUrl && (
          <Button
            variant="primary"
            size="sm"
            onClick={onUpload}
            loading={isUploading}
            disabled={isUploading}
          >
            <Check className="w-4 h-4 mr-2" />
            Save Photo
          </Button>
        )}
      </div>
      
      <p className="text-text-secondary text-xs text-center">
        Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
      </p>
    </div>
  );
}