export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'business_plan' | 'pitch_deck' | 'executive_summary' | 'market_analysis' | 'financial_projections';
  content: DocumentContent;
  status: 'generating' | 'completed' | 'failed';
  progress_data?: DocumentProgress;
  created_at: string;
  updated_at: string;
  file_path?: string;
  file_size?: number;
}

export interface DocumentContent {
  sections: DocumentSection[];
  metadata: {
    company_name: string;
    industry: string;
    stage: string;
    target_audience?: string;
    total_sections: number;
  };
  theme?: DocumentTheme;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'chart' | 'table' | 'image';
  data?: any;
  subsections?: DocumentSubsection[];
}

export interface DocumentSubsection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface DocumentProgress {
  completed_sections: string[];
  last_viewed_section?: string;
  completion_percentage: number;
  time_spent: number; // in minutes
  last_updated: string;
}

export interface DocumentTheme {
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

export interface DocumentPermissions {
  can_read: boolean;
  can_edit: boolean;
  can_download: boolean;
  can_share: boolean;
  can_track_progress: boolean;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_with_email: string;
  permissions: DocumentPermissions;
  expires_at?: string;
  created_at: string;
}