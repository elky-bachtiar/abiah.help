import { User } from './index';

// Core conversation data types
export interface ConversationSummary {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  duration_minutes: number;
  key_topics: string[];
  insights_count: number;
  mentor_persona: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  sentiment_score?: number;
  has_transcript: boolean;
  has_recording: boolean;
  metadata?: Record<string, any>;
}

export interface ConversationDetail extends ConversationSummary {
  transcript?: ConversationTranscript;
  insights: ConversationInsight[];
  context_data: ConversationContext;
  related_documents: RelatedDocument[];
  follow_ups: FollowUpItem[];
}

export interface ConversationTranscript {
  segments: TranscriptSegment[];
  summary: string;
  key_points: string[];
}

export interface TranscriptSegment {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  topics?: string[];
}

// Context awareness types
export interface ConversationContext {
  context_summary: string;
  previous_conversations: PreviousConversation[];
  related_topics: string[];
  user_preferences: Record<string, any>;
  relationship_strength: number;
  context_awareness_level: 'basic' | 'intermediate' | 'advanced';
  last_updated: string;
}

export interface PreviousConversation {
  id: string;
  title: string;
  date: string;
  key_points: string[];
  relevance_score: number;
}

// Progress tracking types
export interface ProgressData {
  overallProgress: number;
  stats: ProgressStats;
  goalProgress: Record<string, number>;
  insights: ProgressInsight[];
  history: ProgressHistoryPoint[];
}

export interface ProgressStats {
  total_conversations: number;
  total_duration_minutes: number;
  completed_goals: number;
  total_goals: number;
  insights_generated: number;
  documents_created: number;
}

export interface ProgressHistoryPoint {
  date: string;
  progress: number;
  milestones_reached: string[];
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  order: number;
}

// Insights types
export interface ConversationInsight {
  id: string;
  conversation_id: string;
  type: 'goal' | 'challenge' | 'progress' | 'theme';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action_items?: string[];
  created_at: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'conversation' | 'resource' | 'action';
  priority: 'low' | 'medium' | 'high';
  relevance_score: number;
  action_url?: string;
  created_at: string;
}

export interface ProgressInsight {
  id: string;
  title: string;
  description: string;
  type: 'improvement' | 'milestone' | 'challenge';
  created_at: string;
}

// Timeline types
export interface TimelineItem {
  id: string;
  type: 'conversation' | 'milestone' | 'document' | 'insight';
  title: string;
  description?: string;
  date: string;
  icon?: string;
  data: any;
}

// Related document types
export interface RelatedDocument {
  id: string;
  title: string;
  type: string;
  created_at: string;
  relevance_score: number;
}

export interface FollowUpItem {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'question' | 'topic';
  status: 'pending' | 'completed';
  due_date?: string;
}

// Filter and search types
export interface ConversationFilters {
  dateRange: 'today' | 'week' | 'month' | 'year' | 'all';
  persona?: string;
  topics?: string[];
  minDuration?: number;
  status?: 'completed' | 'in_progress' | 'scheduled' | 'all';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface InsightFilters {
  timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all';
  type: 'goal' | 'challenge' | 'progress' | 'theme' | 'all';
  priority: 'low' | 'medium' | 'high' | 'all';
}

export interface FetchOptions {
  page?: number;
  pageSize?: number;
  filters?: ConversationFilters;
  searchQuery?: string;
  sortBy?: 'date' | 'duration' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}