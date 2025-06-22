import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { fetchUserSettings, updateUserSettings } from '../api/userSettings';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'default' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => Promise<void>;
  setColorScheme: (colorScheme: ColorScheme) => Promise<void>;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [user] = useAtom(userAtom);
  const [theme, setThemeState] = useState<Theme>('system');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = async () => {
      // Try to get theme from localStorage first
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      const storedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;
      
      if (storedTheme) {
        setThemeState(storedTheme);
      }
      
      if (storedColorScheme) {
        setColorSchemeState(storedColorScheme);
      }
      
      // If user is logged in, try to get theme from user settings
      if (user) {
        try {
          const settings = await fetchUserSettings(user.id);
          if (settings.appearance.theme) {
            setThemeState(settings.appearance.theme);
          }
          if (settings.appearance.color_scheme) {
            setColorSchemeState(settings.appearance.color_scheme as ColorScheme);
          }
        } catch (error) {
          console.error('Error loading theme from user settings:', error);
        }
      }
    };
    
    initializeTheme();
  }, [user]);
  
  // Apply theme whenever it changes
  useEffect(() => {
    const applyTheme = () => {
      let newIsDark = false;
      
      if (theme === 'dark') {
        newIsDark = true;
      } else if (theme === 'system') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        newIsDark = prefersDark;
      }
      
      // Apply theme to document
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Apply color scheme
      document.documentElement.setAttribute('data-color-scheme', colorScheme);
      
      // Update state
      setIsDarkMode(newIsDark);
      
      // Store in localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('colorScheme', colorScheme);
    };
    
    applyTheme();
    
    // Listen for system preference changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, colorScheme]);
  
  // Set theme and update user settings
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Update user settings if logged in
    if (user) {
      try {
        await updateUserSettings(user.id, {
          appearance: { theme: newTheme }
        });
      } catch (error) {
        console.error('Error updating theme in user settings:', error);
      }
    }
  };
  
  // Set color scheme and update user settings
  const setColorScheme = async (newColorScheme: ColorScheme) => {
    setColorSchemeState(newColorScheme);
    
    // Update user settings if logged in
    if (user) {
      try {
        await updateUserSettings(user.id, {
          appearance: { color_scheme: newColorScheme }
        });
      } catch (error) {
        console.error('Error updating color scheme in user settings:', error);
      }
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}