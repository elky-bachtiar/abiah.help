import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Check, X } from 'lucide-react';
import { UserProfile } from '../../types/Profile';
import { Button } from '../ui/Button-bkp';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ProfileHeader({ 
  profile, 
  isEditMode, 
  onToggleEditMode, 
  onSave, 
  onCancel,
  isLoading
}: ProfileHeaderProps) {
  // Use default image if none provided
  const imageUrl = profile.profile_image_url || '/images/Elky.jpeg';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 mb-6"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Image */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-neutral-100">
            <img 
              src={imageUrl} 
              alt={`${profile.first_name} ${profile.last_name}`} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
            {profile.first_name} {profile.last_name}
          </h1>
          
          {profile.startup_details.company_name && (
            <p className="text-secondary font-medium mb-2">
              {profile.professional_background.current_title} at {profile.startup_details.company_name}
            </p>
          )}
          
          {profile.location && (
            <p className="text-text-secondary mb-4">
              {profile.location}
            </p>
          )}
          
          {profile.bio && (
            <p className="text-text-secondary max-w-2xl">
              {profile.bio}
            </p>
          )}
        </div>
        
        {/* Edit Controls */}
        <div className="flex md:flex-col gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onSave}
                loading={isLoading}
                disabled={isLoading}
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleEditMode}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}