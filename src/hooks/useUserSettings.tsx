import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { UserSettings, SettingsUpdateRequest } from '../types/Settings';
import { fetchUserSettings, updateUserSettings, resetUserSettings, syncUserSettings } from '../api/userSettings';

export function useUserSettings() {
  const [user] = useAtom(userAtom);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userSettings = await fetchUserSettings(user.id);
      setSettings(userSettings);
      
      // Apply theme from settings
      applyTheme(userSettings.appearance.theme, userSettings.appearance.color_scheme);
      
      // Apply font size
      applyFontSize(userSettings.appearance.font_size);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  const updateSettings = useCallback(async (updates: SettingsUpdateRequest) => {
    if (!user || !settings) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const updatedSettings = await updateUserSettings(user.id, updates);
      setSettings(updatedSettings);
      
      // Apply theme if it was updated
      if (updates.appearance?.theme || updates.appearance?.color_scheme) {
        applyTheme(
          updates.appearance.theme || settings.appearance.theme,
          updates.appearance.color_scheme || settings.appearance.color_scheme
        );
      }
      
      // Apply font size if it was updated
      if (updates.appearance?.font_size) {
        applyFontSize(updates.appearance.font_size);
      }
      
      return updatedSettings;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, settings]);
  
  const resetSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const defaultSettings = await resetUserSettings(user.id);
      setSettings(defaultSettings);
      
      // Apply default theme
      applyTheme(defaultSettings.appearance.theme, defaultSettings.appearance.color_scheme);
      
      // Apply default font size
      applyFontSize(defaultSettings.appearance.font_size);
      
      return defaultSettings;
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  const syncSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const syncedSettings = await syncUserSettings(user.id);
      setSettings(syncedSettings);
      
      // Apply theme from synced settings
      applyTheme(syncedSettings.appearance.theme, syncedSettings.appearance.color_scheme);
      
      // Apply font size
      applyFontSize(syncedSettings.appearance.font_size);
      
      return syncedSettings;
    } catch (err) {
      console.error('Error syncing settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Helper function to apply theme
  const applyTheme = (theme: 'light' | 'dark' | 'system', colorScheme: string) => {
    // Determine if we should use dark mode
    let isDark = false;
    
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark = prefersDark;
    }
    
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply color scheme
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
  };
  
  // Helper function to apply font size
  const applyFontSize = (fontSize: string) => {
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'x-large': '20px'
    };
    
    document.documentElement.style.fontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap] || '16px';
  };
  
  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSettings,
    resetSettings,
    syncSettings
  };
}