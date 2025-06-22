import React from 'react';
import { motion } from 'framer-motion';
import { UserSettings } from '../../types/Settings';
import { Card, CardContent } from '../ui/Card';

interface AccessibilitySettingsProps {
  settings: UserSettings;
  onUpdate: (updates: any) => Promise<void>;
}

export function AccessibilitySettings({ settings, onUpdate }: AccessibilitySettingsProps) {
  const handleHighContrastToggle = async (value: boolean) => {
    await onUpdate({
      accessibility: { high_contrast: value }
    });
  };
  
  const handleScreenReaderToggle = async (value: boolean) => {
    await onUpdate({
      accessibility: { screen_reader_optimized: value }
    });
  };
  
  const handleKeyboardShortcutsToggle = async (value: boolean) => {
    await onUpdate({
      accessibility: { keyboard_shortcuts_enabled: value }
    });
  };
  
  const handleShortcutChange = async (key: string, value: string) => {
    await onUpdate({
      accessibility: {
        custom_shortcuts: {
          ...settings.accessibility.custom_shortcuts,
          [key]: value
        }
      }
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
      {/* Visual Accessibility */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Visual Accessibility</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Adjust visual settings to improve readability and contrast.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-text-primary dark:text-white font-medium">High Contrast Mode</h4>
                <p className="text-sm text-text-secondary dark:text-neutral-400">
                  Increase contrast for better readability
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.accessibility.high_contrast}
                  onChange={(e) => handleHighContrastToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-text-primary dark:text-white font-medium">Screen Reader Optimization</h4>
                <p className="text-sm text-text-secondary dark:text-neutral-400">
                  Enhance compatibility with screen readers
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.accessibility.screen_reader_optimized}
                  onChange={(e) => handleScreenReaderToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Keyboard Shortcuts */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Keyboard Shortcuts</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Configure keyboard shortcuts for faster navigation.
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-text-primary dark:text-white font-medium">Enable Keyboard Shortcuts</h4>
              <p className="text-sm text-text-secondary dark:text-neutral-400">
                Use keyboard shortcuts for common actions
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.accessibility.keyboard_shortcuts_enabled}
                onChange={(e) => handleKeyboardShortcutsToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {settings.accessibility.keyboard_shortcuts_enabled && (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-primary dark:text-white">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-primary dark:text-white">Shortcut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {[
                    { action: 'Search', shortcut: '/', key: 'search' },
                    { action: 'New Consultation', shortcut: 'N', key: 'new_consultation' },
                    { action: 'Save Document', shortcut: 'Ctrl+S', key: 'save_document' },
                    { action: 'Help', shortcut: '?', key: 'help' }
                  ].map((item) => (
                    <tr key={item.key} className="bg-white dark:bg-neutral-900">
                      <td className="px-4 py-3 text-sm text-text-primary dark:text-white">{item.action}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={settings.accessibility.custom_shortcuts?.[item.key] || item.shortcut}
                            onChange={(e) => handleShortcutChange(item.key, e.target.value)}
                            className="w-20 px-2 py-1 text-center border rounded text-sm transition-colors border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                          />
                          <button
                            onClick={() => handleShortcutChange(item.key, item.shortcut)}
                            className="text-xs text-text-secondary dark:text-neutral-400 hover:text-primary dark:hover:text-white transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Focus Mode */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Focus Mode</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Reduce distractions and focus on your current task.
          </p>
          
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-text-secondary dark:text-neutral-400 text-sm">
              Focus mode settings will be available in a future update. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}