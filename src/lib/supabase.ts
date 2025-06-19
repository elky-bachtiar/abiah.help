import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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