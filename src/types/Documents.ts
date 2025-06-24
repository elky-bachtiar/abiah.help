export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'business_plan' | 'pitch_deck' | 'executive_summary' | 'market_analysis' | 'financial_projections' | 'consultation_summary';
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

/**
 * Generated document from LLM
 */
export interface GeneratedDocument {
  id: string;
  consultation_id: string;
  conversation_transcript_id?: string;
  document_type: 'pitch_deck' | 'business_plan' | 'market_analysis' | 'consultation_summary';
  title: string;
  content: any;
  metadata: {
    generation_parameters?: any;
    generated_at: string;
    model: string;
    [key: string]: any;
  };
  generated_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Document generation request
 */
export interface DocumentGenerationRequest {
  id: string;
  consultation_id: string;
  conversation_transcript_id?: string;
  requested_document_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parameters: any;
  result_document_id?: string;
  created_at: string;
}

/**
 * Pitch deck document content
 */
export interface PitchDeckContent {
  slides: PitchDeckSlide[];
  metadata: {
    company_name: string;
    industry: string;
    slide_count: number;
    [key: string]: any;
  };
}

/**
 * Pitch deck slide
 */
export interface PitchDeckSlide {
  id: string;
  title: string;
  type: 'title' | 'problem' | 'solution' | 'market' | 'business_model' | 'traction' | 'team' | 'competition' | 'financials' | 'ask' | 'contact' | 'other';
  content: string;
  order?: number;
}

/**
 * Business plan content
 */
export interface BusinessPlanContent {
  sections: BusinessPlanSection[];
  metadata: {
    business_name: string;
    plan_type: string;
    section_count: number;
    [key: string]: any;
  };
}

/**
 * Business plan section
 */
export interface BusinessPlanSection {
  id: string;
  title: string;
  content: string;
  order: number;
  subsections?: BusinessPlanSubsection[];
}

/**
 * Business plan subsection
 */
export interface BusinessPlanSubsection {
  id: string;
  title: string;
  content: string;
  order: number;
}

/**
 * Market analysis content
 */
export interface MarketAnalysisContent {
  sections: MarketAnalysisSection[];
  metadata: {
    industry: string;
    geographic_focus: string;
    research_depth: string;
    section_count: number;
    [key: string]: any;
  };
}

/**
 * Market analysis section
 */
export interface MarketAnalysisSection {
  id: string;
  title: string;
  content: string;
  order: number;
  charts?: any[];
}

/**
 * Consultation summary content
 */
export interface ConsultationSummaryContent {
  sections: ConsultationSummarySection[];
  metadata: {
    session_type: string;
    key_topics: string[];
    section_count: number;
    [key: string]: any;
  };
}

/**
 * Consultation summary section
 */
export interface ConsultationSummarySection {
  id: string;
  title: string;
  content: string;
  order: number;
}