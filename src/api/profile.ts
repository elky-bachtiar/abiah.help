import { supabase } from '../lib/supabase';
import { UserProfile, ProfileUpdateRequest, PhotoUploadResponse } from '../types/Profile';
import { User } from '../types';

/**
 * Fetch user profile data
 * @param userId User ID
 * @returns Promise with user profile data
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    // Get user data from auth.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Check if we have extended profile data in a profiles table
    // For now, we'll use mock data combined with the auth user data
    
    // Mock profile data
    const mockProfileData = {
      startup_details: {
        company_name: 'Abiah Ventures',
        company_description: 'AI-powered startup mentorship platform',
        industry: 'AI/SaaS',
        stage: 'seed' as const,
        team_size: 5,
        funding_raised: 750000,
        founding_date: '2024-01-01',
        website_url: 'https://abiah.help'
      },
      professional_background: {
        current_title: 'Founder & CEO',
        previous_experience: 'Previously CTO at Avazu, DevOps Engineer at Dutch Government',
        skills: ['AI', 'DevSecOps', 'Infrastructure', 'Startup Leadership'],
        achievements: ['Built and scaled 3 successful startups', 'Managed government-scale infrastructure']
      },
      preferences: {
        communication_frequency: 'high' as const,
        consultation_reminders: true,
        marketing_emails: true
      },
      location: 'Amsterdam, Netherlands',
      timezone: 'Europe/Amsterdam',
      bio: 'Passionate about using AI to help founders succeed. 3x founder with experience in scaling startups and managing large-scale infrastructure.',
      phone: '+31612345678'
    };
    
    // Combine user data with mock profile data
    const profile: UserProfile = {
      user_id: userData.id,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email,
      profile_image_url: userData.avatar_url,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      ...mockProfileData
    };
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param userId User ID
 * @param updates Profile updates
 * @returns Promise with updated user data
 */
export const updateUserProfile = async (userId: string, updates: ProfileUpdateRequest): Promise<User> => {
  try {
    // Update user metadata in auth.users
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: updates.first_name,
        last_name: updates.last_name,
        ...updates
      }
    });
    
    if (error) throw error;
    
    // In a real implementation, we would also update extended profile data in a profiles table
    
    return {
      id: data.user.id,
      email: data.user.email!,
      first_name: data.user.user_metadata?.first_name,
      last_name: data.user.user_metadata?.last_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at!,
      updated_at: data.user.updated_at!,
      user_metadata: data.user.user_metadata
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload profile photo
 * @param userId User ID
 * @param file File to upload
 * @returns Promise with upload response
 */
export const uploadProfilePhoto = async (userId: string, file: File): Promise<PhotoUploadResponse> => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    // Update user metadata with new avatar URL
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });
    
    return {
      url: publicUrl,
      path: data.path,
      size: file.size,
      success: true
    };
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};