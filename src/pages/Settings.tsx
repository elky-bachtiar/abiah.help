import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { SettingsTabs } from '../components/settings/SettingsTabs';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { AccessibilitySettings } from '../components/settings/AccessibilitySettings';
import { LanguageSettings } from '../components/settings/LanguageSettings';
import { Button } from '../components/ui/Button-bkp';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card, CardContent } from '../components/ui/Card';

export function Settings() {
  const [activeTab, setActiveTab] = useState('appearance');
  const { settings, isLoading, error, updateSettings, resetSettings } = useUserSettings();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      await resetSettings();
    }
  };
  
  if (isLoading && !settings) {
    return (
      <div className="min-h-screen bg-background-secondary dark:bg-neutral-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !settings) {
    return (
      <div className="min-h-screen bg-background-secondary dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-xl font-semibold text-primary dark:text-white mb-2">Error Loading Settings</h2>
              <p className="text-text-secondary dark:text-neutral-400 mb-4">{error || 'Failed to load settings data'}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background-secondary dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center mb-2">
            <SettingsIcon className="w-8 h-8 text-primary dark:text-white mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-text-secondary dark:text-neutral-400 text-lg">
            Customize your experience and preferences
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar on larger screens */}
          <div className="hidden md:block md:col-span-1">
            <div className="space-y-1">
              {[
                { id: 'appearance', label: 'Appearance', icon: 'palette' },
                { id: 'notifications', label: 'Notifications', icon: 'bell' },
                { id: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
                { id: 'language', label: 'Language & Region', icon: 'globe' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                      : 'text-text-secondary hover:bg-neutral-100 hover:text-primary dark:hover:bg-neutral-800 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={handleResetSettings}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-left text-text-secondary hover:bg-neutral-100 hover:text-error dark:hover:bg-neutral-800 dark:hover:text-error transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>Reset All Settings</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            {/* Tabs for mobile */}
            <div className="md:hidden">
              <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            
            {/* Settings content */}
            <div>
              {activeTab === 'appearance' && (
                <AppearanceSettings settings={settings} onUpdate={updateSettings} />
              )}
              
              {activeTab === 'notifications' && (
                <NotificationSettings settings={settings} onUpdate={updateSettings} />
              )}
              
              {activeTab === 'accessibility' && (
                <AccessibilitySettings settings={settings} onUpdate={updateSettings} />
              )}
              
              {activeTab === 'language' && (
                <LanguageSettings settings={settings} onUpdate={updateSettings} />
              )}
            </div>
            
            {/* Reset button for mobile */}
            <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-700 md:hidden">
              <Button
                variant="outline"
                onClick={handleResetSettings}
                className="w-full justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}