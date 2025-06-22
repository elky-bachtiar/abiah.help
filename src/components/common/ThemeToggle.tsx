import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, isDarkMode } = useTheme();
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 flex">
        <button
          onClick={() => handleThemeChange('light')}
          className={`relative rounded-md p-2 ${
            theme === 'light' 
              ? 'text-primary bg-white dark:bg-neutral-700 shadow-sm' 
              : 'text-text-secondary hover:text-primary hover:bg-white/50 dark:hover:bg-neutral-700/50'
          } transition-colors`}
          aria-label="Light mode"
        >
          <Sun className="w-5 h-5" />
          {theme === 'light' && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-md -z-10"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={`relative rounded-md p-2 ${
            theme === 'dark' 
              ? 'text-primary bg-white dark:bg-neutral-700 shadow-sm' 
              : 'text-text-secondary hover:text-primary hover:bg-white/50 dark:hover:bg-neutral-700/50'
          } transition-colors`}
          aria-label="Dark mode"
        >
          <Moon className="w-5 h-5" />
          {theme === 'dark' && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-md -z-10"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
        </button>
        
        <button
          onClick={() => handleThemeChange('system')}
          className={`relative rounded-md p-2 ${
            theme === 'system' 
              ? 'text-primary bg-white dark:bg-neutral-700 shadow-sm' 
              : 'text-text-secondary hover:text-primary hover:bg-white/50 dark:hover:bg-neutral-700/50'
          } transition-colors`}
          aria-label="System theme"
        >
          <Monitor className="w-5 h-5" />
          {theme === 'system' && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-md -z-10"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
        </button>
      </div>
      
      <span className="text-sm text-text-secondary">
        {theme === 'light' && 'Light Mode'}
        {theme === 'dark' && 'Dark Mode'}
        {theme === 'system' && `System (${isDarkMode ? 'Dark' : 'Light'})`}
      </span>
    </div>
  );
}