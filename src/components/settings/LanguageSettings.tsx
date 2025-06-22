import React from 'react';
import { motion } from 'framer-motion';
import { UserSettings } from '../../types/Settings';
import { Card, CardContent } from '../ui/Card';

interface LanguageSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: any) => Promise<void>;
}

export function LanguageSettings({ settings, onUpdate }: LanguageSettingsProps) {
  const handleLanguageChange = async (language: string) => {
    await onUpdate({
      language: { preferred_language: language }
    });
  };
  
  const handleDateFormatChange = async (format: string) => {
    await onUpdate({
      language: { date_format: format }
    });
  };
  
  const handleTimeFormatChange = async (format: string) => {
    await onUpdate({
      language: { time_format: format }
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Language Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Language</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Select your preferred language for the application interface.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { code: 'en', name: 'English', flag: '🇺🇸' },
              { code: 'es', name: 'Español', flag: '🇪🇸' },
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
              { code: 'zh', name: '中文', flag: '🇨🇳' },
              { code: 'ja', name: '日本語', flag: '🇯🇵' }
            ].map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center p-3 rounded-lg border ${
                  settings.language.preferred_language === language.code
                    ? 'border-primary dark:border-white bg-primary/5 dark:bg-white/5'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-primary dark:hover:border-white'
                } transition-colors`}
              >
                <span className="text-xl mr-3">{language.flag}</span>
                <span className="text-text-primary dark:text-white">{language.name}</span>
                
                {settings.language.preferred_language === language.code && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary dark:bg-white" />
                )}
              </button>
            ))}
          </div>
          
          <p className="mt-4 text-sm text-text-secondary dark:text-neutral-400">
            Note: Some languages may have limited translation coverage. English is the fully supported language.
          </p>
        </CardContent>
      </Card>
      
      {/* Date & Time Format */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Date & Time Format</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Choose how dates and times are displayed throughout the application.
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-text-primary dark:text-white font-medium mb-3">Date Format</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { format: 'MM/DD/YYYY', example: '06/20/2025', label: 'MM/DD/YYYY' },
                  { format: 'DD/MM/YYYY', example: '20/06/2025', label: 'DD/MM/YYYY' },
                  { format: 'YYYY-MM-DD', example: '2025-06-20', label: 'YYYY-MM-DD' },
                  { format: 'MMM D, YYYY', example: 'Jun 20, 2025', label: 'Month D, YYYY' }
                ].map((option) => (
                  <button
                    key={option.format}
                    onClick={() => handleDateFormatChange(option.format)}
                    className={`flex flex-col items-start p-3 rounded-lg border ${
                      settings.language.date_format === option.format
                        ? 'border-primary dark:border-white bg-primary/5 dark:bg-white/5'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary dark:hover:border-white'
                    } transition-colors`}
                  >
                    <span className="text-text-primary dark:text-white font-medium">{option.label}</span>
                    <span className="text-sm text-text-secondary dark:text-neutral-400">{option.example}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-text-primary dark:text-white font-medium mb-3">Time Format</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { format: '12h', example: '2:30 PM', label: '12-hour' },
                  { format: '24h', example: '14:30', label: '24-hour' }
                ].map((option) => (
                  <button
                    key={option.format}
                    onClick={() => handleTimeFormatChange(option.format)}
                    className={`flex flex-col items-start p-3 rounded-lg border ${
                      settings.language.time_format === option.format
                        ? 'border-primary dark:border-white bg-primary/5 dark:bg-white/5'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary dark:hover:border-white'
                    } transition-colors`}
                  >
                    <span className="text-text-primary dark:text-white font-medium">{option.label}</span>
                    <span className="text-sm text-text-secondary dark:text-neutral-400">{option.example}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Region Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Region Settings</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Configure regional preferences for currency and measurements.
          </p>
          
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-text-secondary dark:text-neutral-400 text-sm">
              Region-specific settings will be available in a future update. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}