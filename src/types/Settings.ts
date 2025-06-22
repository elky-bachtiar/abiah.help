export interface UserSettings {
  user_id: string;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  language: LanguageSettings;
  created_at: string;
  updated_at: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  color_scheme: 'default' | 'blue' | 'green' | 'purple';
  font_size: 'small' | 'medium' | 'large' | 'x-large';
  reduce_animations: boolean;
}

export interface NotificationSettings {
  email_notifications: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  notification_types: {
    document_updates: boolean;
    consultation_reminders: boolean;
    system_announcements: boolean;
    mentions: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time?: string; // "HH:MM"
    end_time?: string; // "HH:MM"
  };
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  screen_reader_optimized: boolean;
  keyboard_shortcuts_enabled: boolean;
  custom_shortcuts?: Record<string, string>;
}

export interface LanguageSettings {
  preferred_language: string; // ISO code
  date_format: string;
  time_format: '12h' | '24h';
}

export interface SettingsUpdateRequest {
  appearance?: Partial<AppearanceSettings>;
  notifications?: Partial<NotificationSettings>;
  accessibility?: Partial<AccessibilitySettings>;
  language?: Partial<LanguageSettings>;
}