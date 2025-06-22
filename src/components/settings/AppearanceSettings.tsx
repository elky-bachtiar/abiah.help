import React from 'react';
import { motion } from 'framer-motion';
import { UserSettings } from '../../types/Settings';
import { ThemeToggle } from '../common/ThemeToggle';
import { Card, CardContent } from '../ui/Card';

interface AppearanceSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: any) => Promise<void>;
}

export function AppearanceSettings({ settings, onUpdate }: AppearanceSettingsProps) {
  const handleColorSchemeChange = async (scheme: string) => {
    await onUpdate({
      appearance: { color_scheme: scheme }
    });
  };
  
  const handleFontSizeChange = async (size: string) => {
    await onUpdate({
      appearance: { font_size: size }
    });
  };
  
  const handleAnimationsToggle = async (value: boolean) => {
    await onUpdate({
      appearance: { reduce_animations: value }
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
      {/* Theme Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Theme</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Choose your preferred color theme for the application.
          </p>
          
          <ThemeToggle />
        </CardContent>
      </Card>
      
      {/* Color Scheme */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Color Scheme</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Select a color scheme to personalize your experience.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'default', label: 'Default', colors: ['#2A2F6D', '#F9B94E'] },
              { id: 'blue', label: 'Blue', colors: ['#1E40AF', '#F59E0B'] },
              { id: 'green', label: 'Green', colors: ['#047857', '#8B5CF6'] },
              { id: 'purple', label: 'Purple', colors: ['#7E22CE', '#EC4899'] }
            ].map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleColorSchemeChange(scheme.id)}
                className={`relative p-4 rounded-lg border ${
                  settings.appearance.color_scheme === scheme.id
                    ? 'border-primary dark:border-white shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-primary dark:hover:border-white'
                } transition-colors`}
                aria-label={`${scheme.label} color scheme`}
              >
                <div className="flex justify-center mb-3">
                  <div className="flex space-x-2">
                    {scheme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-text-primary dark:text-white">
                  {scheme.label}
                </p>
                
                {settings.appearance.color_scheme === scheme.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary dark:bg-white" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Font Size */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Font Size</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Adjust the text size throughout the application.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-primary dark:text-white">Text Size</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary dark:text-neutral-400">A</span>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={['small', 'medium', 'large', 'x-large'].indexOf(settings.appearance.font_size)}
                  onChange={(e) => {
                    const sizes = ['small', 'medium', 'large', 'x-large'];
                    handleFontSizeChange(sizes[parseInt(e.target.value)]);
                  }}
                  className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-base text-text-secondary dark:text-neutral-400">A</span>
              </div>
            </div>
            
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="text-text-primary dark:text-white mb-2">Preview:</p>
              <h4 className="text-lg font-semibold text-primary dark:text-white mb-2">Heading Text</h4>
              <p className="text-text-secondary dark:text-neutral-400">
                This is how your content will appear with the selected font size. 
                Adjust the slider to find the most comfortable reading experience for you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Animations */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Animations</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Control motion and animation effects throughout the application.
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-text-primary dark:text-white font-medium">Reduce Animations</h4>
              <p className="text-sm text-text-secondary dark:text-neutral-400">
                Minimize motion effects for a more stable interface
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.appearance.reduce_animations}
                onChange={(e) => handleAnimationsToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}