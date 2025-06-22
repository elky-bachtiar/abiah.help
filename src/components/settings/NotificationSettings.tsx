import React from 'react';
import { motion } from 'framer-motion';
import { UserSettings } from '../../types/Settings';
import { Card, CardContent } from '../ui/Card';

interface NotificationSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: any) => Promise<void>;
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const handleEmailToggle = async (value: boolean) => {
    await onUpdate({
      notifications: { email_notifications: value }
    });
  };
  
  const handleEmailFrequencyChange = async (frequency: string) => {
    await onUpdate({
      notifications: { email_frequency: frequency }
    });
  };
  
  const handleNotificationTypeToggle = async (type: string, value: boolean) => {
    await onUpdate({
      notifications: {
        notification_types: {
          ...settings.notifications.notification_types,
          [type]: value
        }
      }
    });
  };
  
  const handleQuietHoursToggle = async (value: boolean) => {
    await onUpdate({
      notifications: {
        quiet_hours: {
          ...settings.notifications.quiet_hours,
          enabled: value
        }
      }
    });
  };
  
  const handleQuietHoursTimeChange = async (type: 'start_time' | 'end_time', value: string) => {
    await onUpdate({
      notifications: {
        quiet_hours: {
          ...settings.notifications.quiet_hours,
          [type]: value
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
      {/* Email Notifications */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Email Notifications</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Control how and when you receive email notifications.
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-text-primary dark:text-white font-medium">Email Notifications</h4>
              <p className="text-sm text-text-secondary dark:text-neutral-400">
                Receive important updates via email
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.email_notifications}
                onChange={(e) => handleEmailToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {settings.notifications.email_notifications && (
            <div>
              <h4 className="text-text-primary dark:text-white font-medium mb-3">Email Frequency</h4>
              <div className="space-y-2">
                {[
                  { id: 'immediate', label: 'Immediate', description: 'Send emails as events occur' },
                  { id: 'daily', label: 'Daily Digest', description: 'Send a daily summary of all notifications' },
                  { id: 'weekly', label: 'Weekly Digest', description: 'Send a weekly summary of all notifications' }
                ].map((option) => (
                  <div key={option.id} className="flex items-start">
                    <input
                      type="radio"
                      id={`frequency-${option.id}`}
                      name="email-frequency"
                      className="mt-1 text-primary focus:ring-primary dark:text-primary dark:focus:ring-primary"
                      checked={settings.notifications.email_frequency === option.id}
                      onChange={() => handleEmailFrequencyChange(option.id)}
                    />
                    <label htmlFor={`frequency-${option.id}`} className="ml-2 block">
                      <span className="text-text-primary dark:text-white font-medium">{option.label}</span>
                      <p className="text-sm text-text-secondary dark:text-neutral-400">{option.description}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Notification Types */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Notification Types</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Choose which types of notifications you want to receive.
          </p>
          
          <div className="space-y-4">
            {[
              { id: 'document_updates', label: 'Document Updates', description: 'Notifications about document changes and comments' },
              { id: 'consultation_reminders', label: 'Consultation Reminders', description: 'Reminders about upcoming and scheduled consultations' },
              { id: 'system_announcements', label: 'System Announcements', description: 'Important announcements about Abiah.help' },
              { id: 'mentions', label: 'Mentions', description: 'Notifications when someone mentions you in comments or chats' }
            ].map((type) => (
              <div key={type.id} className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-text-primary dark:text-white font-medium">{type.label}</h4>
                  <p className="text-sm text-text-secondary dark:text-neutral-400">{type.description}</p>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.notification_types[type.id as keyof typeof settings.notifications.notification_types]}
                    onChange={(e) => handleNotificationTypeToggle(type.id, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Quiet Hours */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary dark:text-white mb-4">Quiet Hours</h3>
          <p className="text-text-secondary dark:text-neutral-400 mb-6">
            Set times when you don't want to receive notifications.
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-text-primary dark:text-white font-medium">Enable Quiet Hours</h4>
              <p className="text-sm text-text-secondary dark:text-neutral-400">
                Pause notifications during specified hours
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.quiet_hours.enabled}
                onChange={(e) => handleQuietHoursToggle(e.target.checked)}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {settings.notifications.quiet_hours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={settings.notifications.quiet_hours.start_time || '22:00'}
                  onChange={(e) => handleQuietHoursTimeChange('start_time', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={settings.notifications.quiet_hours.end_time || '07:00'}
                  onChange={(e) => handleQuietHoursTimeChange('end_time', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}