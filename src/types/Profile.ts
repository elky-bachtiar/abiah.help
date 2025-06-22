export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  profile_image_url?: string;
  location?: string;
  timezone?: string;
  startup_details: StartupDetails;
  professional_background: ProfessionalBackground;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface StartupDetails {
  company_name?: string;
  company_description?: string;
  industry?: string;
  stage: 'idea' | 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth';
  team_size?: number;
  funding_raised?: number;
  founding_date?: string;
  website_url?: string;
}

export interface ProfessionalBackground {
  current_title?: string;
  previous_experience?: string;
  skills: string[];
  achievements?: string[];
}

export interface UserPreferences {
  communication_frequency: 'high' | 'medium' | 'low';
  consultation_reminders: boolean;
  marketing_emails: boolean;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  startup_details?: Partial<StartupDetails>;
  professional_background?: Partial<ProfessionalBackground>;
  preferences?: Partial<UserPreferences>;
}

export interface PhotoUploadResponse {
  url: string;
  path: string;
  size: number;
  success: boolean;
}