import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { ProfileUpdateRequest } from '../types/Profile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PhotoUpload } from '../components/profile/PhotoUpload';
import { ProfileEditForm } from '../components/profile/ProfileEditForm';
import { ProfileDisplay } from '../components/profile/ProfileDisplay';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card, CardContent } from '../components/ui/Card';

export function ProfilePage() {
  const { 
    profile, 
    isLoading, 
    error, 
    isEditMode, 
    toggleEditMode, 
    updateProfile, 
    loadProfile 
  } = useProfile();
  
  const {
    previewUrl,
    isUploading,
    uploadError,
    handleFileSelect,
    clearSelectedFile,
    uploadPhoto
  } = usePhotoUpload();
  
  const [formRef] = useState<React.RefObject<HTMLFormElement>>(React.createRef<HTMLFormElement>());
  
  const handleSave = async () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
  
  const handleCancel = () => {
    toggleEditMode();
  };
  
  const handleUpdateProfile = async (updates: ProfileUpdateRequest) => {
    await updateProfile(updates);
  };
  
  const handlePhotoUpload = async () => {
    const result = await uploadPhoto();
    if (result) {
      // Reload profile to get updated avatar URL
      loadProfile();
    }
  };
  
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-primary mb-2">Error Loading Profile</h2>
              <p className="text-text-secondary mb-4">{error || 'Failed to load profile data'}</p>
              <button
                onClick={loadProfile}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Profile
          </h1>
          <p className="text-text-secondary text-lg">
            Manage your personal information and startup details
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <PhotoUpload
                  currentPhotoUrl={profile.profile_image_url}
                  previewUrl={previewUrl}
                  isUploading={isUploading}
                  error={uploadError}
                  onFileSelect={handleFileSelect}
                  onClear={clearSelectedFile}
                  onUpload={handlePhotoUpload}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <ProfileHeader
              profile={profile}
              isEditMode={isEditMode}
              onToggleEditMode={toggleEditMode}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
            
            {isEditMode ? (
              <form ref={formRef} onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: any = {};
                formData.forEach((value, key) => {
                  data[key] = value;
                });
                handleUpdateProfile(data as ProfileUpdateRequest);
              }}>
                <ProfileEditForm
                  profile={profile}
                  onUpdate={handleUpdateProfile}
                />
              </form>
            ) : (
              <ProfileDisplay profile={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}