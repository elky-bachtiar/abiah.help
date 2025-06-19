export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: {
    provider?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Consultation {
  id: string;
  user_id: string;
  conversation_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
  context_data?: {
    focus_area?: string;
    questions?: string[];
    goals?: string[];
  };
  summary?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  persona_id: string;
  greeting?: string;
  context?: string;
  status: 'active' | 'ended';
}

export interface VideoConfig {
  conversationId: string;
  conversationUrl: string;
  backgroundVideoUrl: string;
  posterImageUrl: string;
  userName?: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'business_plan' | 'pitch_deck' | 'executive_summary';
  content: any;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ConsultationScreen {
  id: string;
  name: 'intro' | 'loading' | 'settings' | 'conversation' | 'summary' | 'error';
  title: string;
  isActive: boolean;
}

export interface VideoControls {
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  volume: number;
}

export interface SessionTimer {
  startTime: Date;
  duration: number;
  remainingTime: number;
  isActive: boolean;
}