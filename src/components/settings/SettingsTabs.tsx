import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Bell, Accessibility, Globe } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'language', label: 'Language & Region', icon: Globe }
  ];
  
  return (
    <div className="mb-8">
      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-3 px-6 text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-primary dark:text-white' 
                  : 'text-text-secondary hover:text-primary dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Mobile Tabs */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-3 px-4 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                isActive 
                  ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white' 
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-primary dark:hover:bg-neutral-800 dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}