import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { 
  ConversationSummary, 
  ConversationDetail, 
  ConversationContext,
  ConversationFilters,
  PaginationState,
  Goal,
  Milestone,
  ConversationInsight,
  Recommendation,
  ProgressData,
  InsightFilters,
  FetchOptions,
  TimelineItem
} from '../types/Conversation';

// Mock data for development
import { 
  mockConversations, 
  mockGoals, 
  mockInsights, 
  mockRecommendations,
  mockProgressData
} from './mockConversationData';

// Core conversation history atoms
export const conversationHistoryAtom = atom<ConversationSummary[]>(mockConversations);
export const selectedConversationIdAtom = atom<string | null>(null);
export const conversationDetailAtom = atom<ConversationDetail | null>(null);

// Filters and search atoms
export const conversationFiltersAtom = atom<ConversationFilters>({
  dateRange: 'all',
  persona: undefined,
  topics: [],
  minDuration: 0,
  status: 'all'
});

export const conversationSearchAtom = atom<string>('');
export const conversationSortAtom = atom<{ sortBy: 'date' | 'duration' | 'relevance', sortOrder: 'asc' | 'desc' }>({
  sortBy: 'date',
  sortOrder: 'desc'
});

export const paginationAtom = atom<PaginationState>({
  page: 1,
  pageSize: 10,
  totalItems: mockConversations.length,
  totalPages: Math.ceil(mockConversations.length / 10)
});

// Context awareness atoms
export const currentContextAtom = atom<ConversationContext | null>(null);
export const contextVisibilityAtom = atom<boolean>(true);
export const contextExpandedAtom = atom<boolean>(false);

// Progress tracking atoms
export const userProgressAtom = atom<ProgressData>(mockProgressData);
export const goalsAtom = atom<Goal[]>(mockGoals);
export const selectedTimeframeAtom = atom<'week' | 'month' | 'quarter' | 'year'>('month');

// Insights atoms
export const conversationInsightsAtom = atom<ConversationInsight[]>(mockInsights);
export const recommendationsAtom = atom<Recommendation[]>(mockRecommendations);
export const insightFiltersAtom = atom<InsightFilters>({
  timeframe: 'month',
  type: 'all',
  priority: 'all'
});

// Timeline atoms
export const timelineItemsAtom = atom<TimelineItem[]>([]);
export const timelineViewAtom = atom<'compact' | 'detailed'>('compact');

// Loading and error states
export const loadingStateAtom = atom<boolean>(false);
export const errorStateAtom = atom<string | null>(null);

// Persistence for user preferences
export const userPreferencesAtom = atomWithStorage('conversation-history-preferences', {
  defaultPageSize: 10,
  defaultSortBy: 'date',
  defaultSortOrder: 'desc',
  showContextIndicator: true,
  highContrastMode: false
});

// Derived atoms
export const filteredConversationsAtom = atom((get) => {
  const conversations = get(conversationHistoryAtom);
  const filters = get(conversationFiltersAtom);
  const searchQuery = get(conversationSearchAtom).toLowerCase();
  const { sortBy, sortOrder } = get(conversationSortAtom);
  
  // Apply filters
  let filtered = [...conversations];
  
  // Filter by date range
  if (filters.dateRange !== 'all') {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (filters.dateRange) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filtered = filtered.filter(conv => new Date(conv.created_at) >= cutoffDate);
  }
  
  // Filter by persona
  if (filters.persona && filters.persona !== 'all') {
    filtered = filtered.filter(conv => conv.mentor_persona === filters.persona);
  }
  
  // Filter by topics
  if (filters.topics && filters.topics.length > 0) {
    filtered = filtered.filter(conv => 
      filters.topics!.some(topic => conv.key_topics.includes(topic))
    );
  }
  
  // Filter by minimum duration
  if (filters.minDuration && filters.minDuration > 0) {
    filtered = filtered.filter(conv => conv.duration_minutes >= filters.minDuration);
  }
  
  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(conv => conv.status === filters.status);
  }
  
  // Apply search query
  if (searchQuery) {
    filtered = filtered.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery) ||
      conv.key_topics.some(topic => topic.toLowerCase().includes(searchQuery))
    );
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'duration':
        comparison = a.duration_minutes - b.duration_minutes;
        break;
      case 'relevance':
        // For relevance, we'd typically use a score from the backend
        // Here we'll use a simple heuristic based on insights count and recency
        const aScore = a.insights_count * (1 / (Date.now() - new Date(a.created_at).getTime()));
        const bScore = b.insights_count * (1 / (Date.now() - new Date(b.created_at).getTime()));
        comparison = aScore - bScore;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return filtered;
});

export const paginatedConversationsAtom = atom((get) => {
  const filtered = get(filteredConversationsAtom);
  const { page, pageSize } = get(paginationAtom);
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return filtered.slice(start, end);
});

export const conversationStatsAtom = atom((get) => {
  const conversations = get(conversationHistoryAtom);
  
  const totalDuration = conversations.reduce((sum, conv) => sum + conv.duration_minutes, 0);
  const totalInsights = conversations.reduce((sum, conv) => sum + conv.insights_count, 0);
  const averageDuration = conversations.length > 0 ? totalDuration / conversations.length : 0;
  
  const byPersona = conversations.reduce((acc, conv) => {
    acc[conv.mentor_persona] = (acc[conv.mentor_persona] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byMonth = conversations.reduce((acc, conv) => {
    const month = new Date(conv.created_at).toLocaleString('default', { month: 'long' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: conversations.length,
    totalDuration,
    totalInsights,
    averageDuration,
    byPersona,
    byMonth
  };
});

export const filteredInsightsAtom = atom((get) => {
  const insights = get(conversationInsightsAtom);
  const filters = get(insightFiltersAtom);
  
  let filtered = [...insights];
  
  // Filter by timeframe
  if (filters.timeframe !== 'all') {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (filters.timeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filtered = filtered.filter(insight => new Date(insight.created_at) >= cutoffDate);
  }
  
  // Filter by type
  if (filters.type !== 'all') {
    filtered = filtered.filter(insight => insight.type === filters.type);
  }
  
  // Filter by priority
  if (filters.priority !== 'all') {
    filtered = filtered.filter(insight => insight.priority === filters.priority);
  }
  
  return filtered;
});

// API integration (mocked for development)
export const conversationContextAPI = {
  getConversationHistory: async (userId: string, options?: FetchOptions): Promise<{ conversations: ConversationSummary[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data
    return { conversations: mockConversations };
  },
  
  getConversationDetail: async (conversationId: string): Promise<ConversationDetail> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Find the conversation summary
    const summary = mockConversations.find(c => c.id === conversationId);
    
    if (!summary) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // Create a mock detail object
    return {
      ...summary,
      transcript: {
        segments: [
          {
            id: '1',
            speaker: 'user',
            text: 'How can I improve my pitch deck for investors?',
            timestamp: 0
          },
          {
            id: '2',
            speaker: 'ai',
            text: 'Great question! Your pitch deck should focus on these key elements: problem statement, solution, market size, business model, traction, team, and funding ask. Let\'s go through each one.',
            timestamp: 5
          }
        ],
        summary: 'Discussion about improving pitch deck for investor presentations',
        key_points: ['Focus on clear problem statement', 'Highlight traction metrics', 'Simplify slides']
      },
      insights: mockInsights.filter(i => i.conversation_id === conversationId),
      context_data: {
        context_summary: 'Previous conversations focused on business model and market analysis',
        previous_conversations: [
          {
            id: 'prev-1',
            title: 'Business Model Canvas Review',
            date: '2025-05-15',
            key_points: ['Subscription pricing model', 'Channel strategy'],
            relevance_score: 0.85
          }
        ],
        related_topics: ['pitch deck', 'investor presentation', 'funding'],
        user_preferences: {
          communication_style: 'direct',
          detail_level: 'high'
        },
        relationship_strength: 0.72,
        context_awareness_level: 'intermediate',
        last_updated: new Date().toISOString()
      },
      related_documents: [
        {
          id: 'doc-1',
          title: 'Pitch Deck Template',
          type: 'pitch_deck',
          created_at: '2025-05-10T14:30:00Z',
          relevance_score: 0.95
        }
      ],
      follow_ups: [
        {
          id: 'follow-1',
          title: 'Review updated pitch deck',
          description: 'Schedule a follow-up to review the revised pitch deck',
          type: 'action',
          status: 'pending',
          due_date: '2025-06-25T00:00:00Z'
        }
      ]
    };
  },
  
  getRelevantContext: async (userId: string, options?: { current_topic?: string, limit?: number }): Promise<ConversationContext> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock context data
    return {
      context_summary: 'AI remembers your previous discussions about business model, market analysis, and funding strategy',
      previous_conversations: [
        {
          id: 'prev-1',
          title: 'Business Model Canvas Review',
          date: '2025-05-15',
          key_points: ['Subscription pricing model', 'Channel strategy'],
          relevance_score: 0.85
        },
        {
          id: 'prev-2',
          title: 'Market Analysis Discussion',
          date: '2025-05-10',
          key_points: ['Target market size', 'Competitor analysis'],
          relevance_score: 0.78
        }
      ],
      related_topics: ['business model', 'market analysis', 'funding', 'pitch deck'],
      user_preferences: {
        communication_style: 'direct',
        detail_level: 'high'
      },
      relationship_strength: 0.72,
      context_awareness_level: 'intermediate',
      last_updated: new Date().toISOString()
    };
  },
  
  getUserInsights: async (userId: string): Promise<{ insights_summary: { recent_insights: ConversationInsight[] }, recommendations: Recommendation[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return mock insights and recommendations
    return {
      insights_summary: {
        recent_insights: mockInsights
      },
      recommendations: mockRecommendations
    };
  },
  
  getUserProgress: async (userId: string): Promise<ProgressData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return mock progress data
    return mockProgressData;
  },
  
  getUserGoals: async (userId: string): Promise<Goal[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock goals
    return mockGoals;
  },
  
  updateGoal: async (goalId: string, updates: Partial<Goal>): Promise<Goal> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Find the goal to update
    const goal = mockGoals.find(g => g.id === goalId);
    
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    
    // Return updated goal
    return {
      ...goal,
      ...updates,
      updated_at: new Date().toISOString()
    };
  },
  
  getTimelineItems: async (userId: string): Promise<TimelineItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate timeline items from conversations, goals, and insights
    const timelineItems: TimelineItem[] = [
      ...mockConversations.map(conv => ({
        id: `timeline-conv-${conv.id}`,
        type: 'conversation' as const,
        title: conv.title,
        description: `${conv.duration_minutes} minute conversation with ${conv.mentor_persona} mentor`,
        date: conv.created_at,
        data: conv
      })),
      ...mockGoals.flatMap(goal => 
        goal.milestones
          .filter(m => m.completed)
          .map(milestone => ({
            id: `timeline-milestone-${milestone.id}`,
            type: 'milestone' as const,
            title: milestone.title,
            description: `Completed milestone for goal: ${goal.title}`,
            date: milestone.completed_at || goal.updated_at,
            data: { ...milestone, goal }
          }))
      ),
      ...mockInsights.map(insight => ({
        id: `timeline-insight-${insight.id}`,
        type: 'insight' as const,
        title: insight.title,
        description: insight.description,
        date: insight.created_at,
        data: insight
      }))
    ];
    
    // Sort by date (newest first)
    timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return timelineItems;
  }
};

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const calculateProgressPercentage = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};