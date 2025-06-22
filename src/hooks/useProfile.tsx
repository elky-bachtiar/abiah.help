import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { UserProfile, ProfileUpdateRequest } from '../types/Profile';
import { fetchUserProfile, updateUserProfile } from '../api/profile';

export function useProfile() {
  const [user] = useAtom(userAtom);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  const updateProfile = useCallback(async (updates: ProfileUpdateRequest) => {
    if (!user || !profile) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await updateUserProfile(user.id, updates);
      
      // Reload profile to get updated data
      await loadProfile();
      
      // Exit edit mode
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, loadProfile]);
  
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);
  
  return {
    profile,
    isLoading,
    error,
    isEditMode,
    loadProfile,
    updateProfile,
    toggleEditMode
  };
}