import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { uploadProfilePhoto } from '../api/profile';

export function usePhotoUpload() {
  const [user] = useAtom(userAtom);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setUploadError(null);
    
    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, []);
  
  const clearSelectedFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError(null);
  }, [previewUrl]);
  
  const uploadPhoto = useCallback(async () => {
    if (!user || !selectedFile) return null;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const response = await uploadProfilePhoto(user.id, selectedFile);
      
      // Clear preview and selected file
      clearSelectedFile();
      
      return response;
    } catch (err) {
      console.error('Error uploading photo:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload photo');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, selectedFile, clearSelectedFile]);
  
  return {
    previewUrl,
    selectedFile,
    isUploading,
    uploadError,
    handleFileSelect,
    clearSelectedFile,
    uploadPhoto
  };
}