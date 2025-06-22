import { supabase } from '../lib/supabase';
import { UserSettings, SettingsUpdateRequest } from '../types/Settings';

// Default settings
const defaultSettings: UserSettings = {
  user_id: '',
  appearance: {
    theme: 'system',
    color_scheme: 'default',
    font_size: 'medium',
    reduce_animations: false
  },
  notifications: {
    email_notifications: true,
    email_frequency: 'daily',
    notification_types: {
      document_updates: true,
      consultation_reminders: true,
      system_announcements: true,
      mentions: true
    },
    quiet_hours: {
      enabled: false
    }
  },
  accessibility: {
    high_contrast: false,
    screen_reader_optimized: false,
    keyboard_shortcuts_enabled: true
  },
  language: {
    preferred_language: 'en',
    date_format: 'MM/DD/YYYY',
    time_format: '12h'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

/**
 * Fetch user settings
 * @param userId User ID
 * @returns Promise with user settings
 */
export const fetchUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    // In a real implementation, we would fetch from a settings table
    // For now, we'll use localStorage and mock data
    
    // Check if settings exist in localStorage
    const storedSettings = localStorage.getItem(`settings-${userId}`);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    
    // If not, return default settings
    const settings = {
      ...defaultSettings,
      user_id: userId
    };
    
    // Store in localStorage
    localStorage.setItem(`settings-${userId}`, JSON.stringify(settings));
    
    return settings;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

/**
 * Update user settings
 * @param userId User ID
 * @param updates Settings updates
 * @returns Promise with updated settings
 */
export const updateUserSettings = async (userId: string, updates: SettingsUpdateRequest): Promise<UserSettings> => {
  try {
    // Get current settings
    const currentSettings = await fetchUserSettings(userId);
    
    // Apply updates
    const updatedSettings: UserSettings = {
      ...currentSettings,
      appearance: {
        ...currentSettings.appearance,
        ...(updates.appearance || {})
      },
      notifications: {
        ...currentSettings.notifications,
        ...(updates.notifications || {}),
        notification_types: {
          ...currentSettings.notifications.notification_types,
          ...(updates.notifications?.notification_types || {})
        },
        quiet_hours: {
          ...currentSettings.notifications.quiet_hours,
          ...(updates.notifications?.quiet_hours || {})
        }
      },
      accessibility: {
        ...currentSettings.accessibility,
        ...(updates.accessibility || {})
      },
      language: {
        ...currentSettings.language,
        ...(updates.language || {})
      },
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(`settings-${userId}`, JSON.stringify(updatedSettings));
    
    // In a real implementation, we would also update the database
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return updatedSettings;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

/**
 * Reset user settings to defaults
 * @param userId User ID
 * @returns Promise with default settings
 */
export const resetUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const settings = {
      ...defaultSettings,
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(`settings-${userId}`, JSON.stringify(settings));
    
    // In a real implementation, we would also update the database
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return settings;
  } catch (error) {
    console.error('Error resetting user settings:', error);
    throw error;
  }
};

/**
 * Sync user settings across devices
 * @param userId User ID
 * @returns Promise with synced settings
 */
export const syncUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    // In a real implementation, we would fetch the latest settings from the database
    // For now, we'll just return the current settings from localStorage
    const settings = await fetchUserSettings(userId);
    return settings;
  } catch (error) {
    console.error('Error syncing user settings:', error);
    throw error;
  }
};