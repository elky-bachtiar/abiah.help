import { 
  ConversationSummary, 
  ConversationInsight, 
  Recommendation, 
  Goal,
  ProgressData
} from '../types/Conversation';

// Mock conversation data
export const mockConversations: ConversationSummary[] = [
  {
    id: 'conv-1',
    user_id: 'user-1',
    title: 'Pitch Deck Review',
    created_at: '2025-06-18T14:30:00Z',
    updated_at: '2025-06-18T15:15:00Z',
    duration_minutes: 45,
    key_topics: ['pitch deck', 'investor presentation', 'funding strategy'],
    insights_count: 5,
    mentor_persona: 'general',
    status: 'completed',
    sentiment_score: 0.8,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-2',
    user_id: 'user-1',
    title: 'Financial Projections Discussion',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-06-15T10:45:00Z',
    duration_minutes: 45,
    key_topics: ['financial projections', 'revenue model', 'unit economics'],
    insights_count: 4,
    mentor_persona: 'fintech',
    status: 'completed',
    sentiment_score: 0.7,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-3',
    user_id: 'user-1',
    title: 'Market Analysis Review',
    created_at: '2025-06-10T16:00:00Z',
    updated_at: '2025-06-10T16:30:00Z',
    duration_minutes: 30,
    key_topics: ['market analysis', 'competitor research', 'target audience'],
    insights_count: 3,
    mentor_persona: 'general',
    status: 'completed',
    sentiment_score: 0.75,
    has_transcript: true,
    has_recording: false
  },
  {
    id: 'conv-4',
    user_id: 'user-1',
    title: 'Product Roadmap Planning',
    created_at: '2025-06-05T11:00:00Z',
    updated_at: '2025-06-05T12:00:00Z',
    duration_minutes: 60,
    key_topics: ['product roadmap', 'feature prioritization', 'development timeline'],
    insights_count: 6,
    mentor_persona: 'b2b-saas',
    status: 'completed',
    sentiment_score: 0.85,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-5',
    user_id: 'user-1',
    title: 'Team Structure Discussion',
    created_at: '2025-06-01T09:30:00Z',
    updated_at: '2025-06-01T10:15:00Z',
    duration_minutes: 45,
    key_topics: ['team structure', 'hiring strategy', 'roles and responsibilities'],
    insights_count: 4,
    mentor_persona: 'general',
    status: 'completed',
    sentiment_score: 0.7,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-6',
    user_id: 'user-1',
    title: 'Regulatory Compliance Review',
    created_at: '2025-05-28T13:00:00Z',
    updated_at: '2025-05-28T14:00:00Z',
    duration_minutes: 60,
    key_topics: ['regulatory compliance', 'legal requirements', 'risk management'],
    insights_count: 7,
    mentor_persona: 'fintech',
    status: 'completed',
    sentiment_score: 0.65,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-7',
    user_id: 'user-1',
    title: 'Marketing Strategy Session',
    created_at: '2025-05-25T15:30:00Z',
    updated_at: '2025-05-25T16:30:00Z',
    duration_minutes: 60,
    key_topics: ['marketing strategy', 'customer acquisition', 'brand positioning'],
    insights_count: 5,
    mentor_persona: 'general',
    status: 'completed',
    sentiment_score: 0.8,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-8',
    user_id: 'user-1',
    title: 'Investor Pitch Practice',
    created_at: '2025-05-20T11:00:00Z',
    updated_at: '2025-05-20T12:00:00Z',
    duration_minutes: 60,
    key_topics: ['investor pitch', 'presentation skills', 'Q&A preparation'],
    insights_count: 6,
    mentor_persona: 'general',
    status: 'completed',
    sentiment_score: 0.75,
    has_transcript: true,
    has_recording: true
  },
  {
    id: 'conv-9',
    user_id: 'user-1',
    title: 'Upcoming Series A Strategy',
    created_at: '2025-06-25T10:00:00Z',
    updated_at: '2025-06-25T10:00:00Z',
    duration_minutes: 60,
    key_topics: ['Series A', 'funding strategy', 'investor relations'],
    insights_count: 0,
    mentor_persona: 'general',
    status: 'scheduled',
    has_transcript: false,
    has_recording: false
  },
  {
    id: 'conv-10',
    user_id: 'user-1',
    title: 'Customer Feedback Analysis',
    created_at: '2025-05-15T14:00:00Z',
    updated_at: '2025-05-15T15:00:00Z',
    duration_minutes: 60,
    key_topics: ['customer feedback', 'product improvements', 'user experience'],
    insights_count: 5,
    mentor_persona: 'general',
    status: 'completed',
    sentiment_score: 0.85,
    has_transcript: true,
    has_recording: true
  }
];

// Mock insights data
export const mockInsights: ConversationInsight[] = [
  {
    id: 'insight-1',
    conversation_id: 'conv-1',
    type: 'goal',
    title: 'Refine pitch deck for clarity',
    description: 'Your pitch deck needs more focus on the problem statement and market opportunity. Consider adding more data points to validate the market size.',
    priority: 'high',
    action_items: [
      'Strengthen problem statement with customer quotes',
      'Add market size visualization',
      'Simplify solution slides'
    ],
    created_at: '2025-06-18T15:15:00Z'
  },
  {
    id: 'insight-2',
    conversation_id: 'conv-1',
    type: 'challenge',
    title: 'Investor objection handling',
    description: 'You need to prepare better for potential investor objections about your go-to-market strategy and competitive differentiation.',
    priority: 'medium',
    action_items: [
      'Create objection handling document',
      'Practice responses to common questions',
      'Add competitive analysis slide'
    ],
    created_at: '2025-06-18T15:15:00Z'
  },
  {
    id: 'insight-3',
    conversation_id: 'conv-2',
    type: 'progress',
    title: 'Financial model improvements',
    description: 'Your financial projections show good progress but need more detailed unit economics and sensitivity analysis.',
    priority: 'medium',
    action_items: [
      'Add detailed unit economics breakdown',
      'Create sensitivity analysis for key metrics',
      'Validate CAC and LTV assumptions'
    ],
    created_at: '2025-06-15T10:45:00Z'
  },
  {
    id: 'insight-4',
    conversation_id: 'conv-3',
    type: 'theme',
    title: 'Competitive landscape evolution',
    description: 'The market is evolving with new entrants focusing on AI-powered solutions. Your positioning needs to address this shift.',
    priority: 'high',
    action_items: [
      'Update competitor analysis',
      'Refine differentiation strategy',
      'Highlight AI capabilities in marketing'
    ],
    created_at: '2025-06-10T16:30:00Z'
  },
  {
    id: 'insight-5',
    conversation_id: 'conv-4',
    type: 'goal',
    title: 'Product roadmap prioritization',
    description: 'Your product roadmap should prioritize features with highest impact on user retention and revenue growth.',
    priority: 'high',
    action_items: [
      'Score features by impact on retention and revenue',
      'Create phased release plan',
      'Align roadmap with fundraising timeline'
    ],
    created_at: '2025-06-05T12:00:00Z'
  },
  {
    id: 'insight-6',
    conversation_id: 'conv-5',
    type: 'challenge',
    title: 'Technical talent acquisition',
    description: 'Finding and retaining senior engineering talent is a key challenge that needs a structured approach.',
    priority: 'medium',
    action_items: [
      'Develop engineering brand strategy',
      'Create competitive compensation package',
      'Establish interview process for technical roles'
    ],
    created_at: '2025-06-01T10:15:00Z'
  },
  {
    id: 'insight-7',
    conversation_id: 'conv-6',
    type: 'theme',
    title: 'Regulatory compliance framework',
    description: 'A comprehensive compliance framework is needed to address the evolving regulatory landscape in your industry.',
    priority: 'high',
    action_items: [
      'Create compliance checklist',
      'Consult with regulatory expert',
      'Implement compliance monitoring system'
    ],
    created_at: '2025-05-28T14:00:00Z'
  }
];

// Mock recommendations data
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Schedule pitch deck review session',
    description: 'Based on your upcoming investor meetings, a focused review of your pitch deck would be valuable.',
    type: 'conversation',
    priority: 'high',
    relevance_score: 0.95,
    action_url: '/consultation/new?topic=pitch-deck',
    created_at: '2025-06-19T08:00:00Z'
  },
  {
    id: 'rec-2',
    title: 'Generate financial projections document',
    description: 'Your conversations about funding strategy indicate you need detailed financial projections.',
    type: 'document',
    priority: 'high',
    relevance_score: 0.9,
    action_url: '/documents/generate?type=financial_projections',
    created_at: '2025-06-19T08:00:00Z'
  },
  {
    id: 'rec-3',
    title: 'Review competitor analysis resource',
    description: 'This guide on competitive analysis frameworks will help address gaps identified in your market positioning.',
    type: 'resource',
    priority: 'medium',
    relevance_score: 0.8,
    action_url: '/resources/competitive-analysis',
    created_at: '2025-06-19T08:00:00Z'
  },
  {
    id: 'rec-4',
    title: 'Complete your funding readiness checklist',
    description: 'You\'re 70% through the funding readiness checklist. Complete the remaining items to improve your chances.',
    type: 'action',
    priority: 'medium',
    relevance_score: 0.85,
    action_url: '/checklist/funding-readiness',
    created_at: '2025-06-19T08:00:00Z'
  },
  {
    id: 'rec-5',
    title: 'Schedule follow-up on team structure',
    description: 'Continue your discussion about optimal team structure for your growth stage.',
    type: 'conversation',
    priority: 'low',
    relevance_score: 0.7,
    action_url: '/consultation/new?topic=team-structure',
    created_at: '2025-06-19T08:00:00Z'
  }
];

// Mock goals data
export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    user_id: 'user-1',
    title: 'Secure Seed Funding',
    description: 'Raise $500K in seed funding to support 18 months of runway',
    target_date: '2025-09-30T00:00:00Z',
    progress: 65,
    status: 'in_progress',
    milestones: [
      {
        id: 'milestone-1-1',
        goal_id: 'goal-1',
        title: 'Finalize pitch deck',
        description: 'Complete investor-ready pitch deck with all key slides',
        completed: true,
        completed_at: '2025-06-15T00:00:00Z',
        order: 1
      },
      {
        id: 'milestone-1-2',
        goal_id: 'goal-1',
        title: 'Create financial model',
        description: 'Develop 3-year financial projections with key assumptions',
        completed: true,
        completed_at: '2025-06-10T00:00:00Z',
        order: 2
      },
      {
        id: 'milestone-1-3',
        goal_id: 'goal-1',
        title: 'Secure first investor meeting',
        description: 'Schedule meeting with at least one potential lead investor',
        completed: true,
        completed_at: '2025-06-18T00:00:00Z',
        order: 3
      },
      {
        id: 'milestone-1-4',
        goal_id: 'goal-1',
        title: 'Receive term sheet',
        description: 'Get at least one term sheet from interested investor',
        completed: false,
        order: 4
      },
      {
        id: 'milestone-1-5',
        goal_id: 'goal-1',
        title: 'Close funding round',
        description: 'Complete all paperwork and receive funds',
        completed: false,
        order: 5
      }
    ],
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-06-18T00:00:00Z'
  },
  {
    id: 'goal-2',
    user_id: 'user-1',
    title: 'Launch MVP',
    description: 'Develop and launch minimum viable product to early adopters',
    target_date: '2025-07-31T00:00:00Z',
    progress: 80,
    status: 'in_progress',
    milestones: [
      {
        id: 'milestone-2-1',
        goal_id: 'goal-2',
        title: 'Finalize feature set',
        description: 'Define core features for MVP release',
        completed: true,
        completed_at: '2025-05-15T00:00:00Z',
        order: 1
      },
      {
        id: 'milestone-2-2',
        goal_id: 'goal-2',
        title: 'Complete development',
        description: 'Finish coding all MVP features',
        completed: true,
        completed_at: '2025-06-10T00:00:00Z',
        order: 2
      },
      {
        id: 'milestone-2-3',
        goal_id: 'goal-2',
        title: 'Internal testing',
        description: 'Complete QA and bug fixing',
        completed: true,
        completed_at: '2025-06-15T00:00:00Z',
        order: 3
      },
      {
        id: 'milestone-2-4',
        goal_id: 'goal-2',
        title: 'Beta testing',
        description: 'Release to limited beta users',
        completed: false,
        order: 4
      },
      {
        id: 'milestone-2-5',
        goal_id: 'goal-2',
        title: 'Public launch',
        description: 'Full public release of MVP',
        completed: false,
        order: 5
      }
    ],
    created_at: '2025-04-15T00:00:00Z',
    updated_at: '2025-06-15T00:00:00Z'
  },
  {
    id: 'goal-3',
    user_id: 'user-1',
    title: 'Achieve Product-Market Fit',
    description: 'Validate product-market fit with key metrics and customer feedback',
    target_date: '2025-12-31T00:00:00Z',
    progress: 25,
    status: 'in_progress',
    milestones: [
      {
        id: 'milestone-3-1',
        goal_id: 'goal-3',
        title: 'Define success metrics',
        description: 'Establish KPIs for product-market fit',
        completed: true,
        completed_at: '2025-05-20T00:00:00Z',
        order: 1
      },
      {
        id: 'milestone-3-2',
        goal_id: 'goal-3',
        title: 'Implement analytics',
        description: 'Set up tracking for all key metrics',
        completed: true,
        completed_at: '2025-06-05T00:00:00Z',
        order: 2
      },
      {
        id: 'milestone-3-3',
        goal_id: 'goal-3',
        title: 'Reach 100 active users',
        description: 'Acquire first 100 active users',
        completed: false,
        order: 3
      },
      {
        id: 'milestone-3-4',
        goal_id: 'goal-3',
        title: 'Achieve 40% retention',
        description: 'Reach 40% monthly retention rate',
        completed: false,
        order: 4
      },
      {
        id: 'milestone-3-5',
        goal_id: 'goal-3',
        title: 'Net Promoter Score > 40',
        description: 'Achieve NPS above 40',
        completed: false,
        order: 5
      }
    ],
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-06-05T00:00:00Z'
  }
];

// Mock progress data
export const mockProgressData: ProgressData = {
  overallProgress: 65,
  stats: {
    total_conversations: 10,
    total_duration_minutes: 515,
    completed_goals: 0,
    total_goals: 3,
    insights_generated: 40,
    documents_created: 8
  },
  goalProgress: {
    'goal-1': 65,
    'goal-2': 80,
    'goal-3': 25
  },
  insights: [
    {
      id: 'progress-insight-1',
      title: 'Funding readiness improving',
      description: 'Your funding readiness score has improved by 15% in the last month',
      type: 'improvement',
      created_at: '2025-06-18T00:00:00Z'
    },
    {
      id: 'progress-insight-2',
      title: 'Pitch deck milestone completed',
      description: 'You\'ve completed the pitch deck milestone for your funding goal',
      type: 'milestone',
      created_at: '2025-06-15T00:00:00Z'
    },
    {
      id: 'progress-insight-3',
      title: 'Product roadmap needs attention',
      description: 'Your product roadmap goal has seen limited progress in the last 2 weeks',
      type: 'challenge',
      created_at: '2025-06-10T00:00:00Z'
    }
  ],
  history: [
    { date: '2025-05-01', progress: 10, milestones_reached: [] },
    { date: '2025-05-15', progress: 25, milestones_reached: ['Define success metrics'] },
    { date: '2025-06-01', progress: 40, milestones_reached: ['Finalize feature set', 'Create financial model'] },
    { date: '2025-06-15', progress: 65, milestones_reached: ['Finalize pitch deck', 'Internal testing'] }
  ]
};