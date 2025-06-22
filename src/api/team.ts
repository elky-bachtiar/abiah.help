import { TeamMember, JoinTeamRequest, TeamMembersResponse, JoinRequestResponse } from '../types/Team';

// Mock team data
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Elky Bachtiar',
    role: 'CEO & Founder',
    bio: 'Elky is a DevOps Engineer at the Dutch Government and ex-CTO at Avazu. As a 3x founder with a proven track record, Elky combines government-scale infrastructure experience with startup agility.',
    image_url: '/images/Elky.jpeg',
    linkedin_url: 'https://linkedin.com/in/elkybachtiar',
    twitter_url: 'https://twitter.com/elkybachtiar',
    email: 'elky@abiah.help',
    expertise_areas: ['AI', 'DevSecOps', 'Infrastructure', 'Startup Leadership'],
    years_experience: 15,
    education: 'Computer Science, University of Amsterdam',
    is_active: true,
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Abiah',
    role: 'AI Co-Founder & CTO',
    bio: 'Abiah is an advanced LLM with 1B+ parameters optimized for startup mentorship. With deep expertise in FinTech regulations and compliance, Abiah provides real-time strategic guidance and emotional intelligence for founders.',
    image_url: '/images/Abiah-ai-co-founder.png',
    expertise_areas: ['Startup Mentorship', 'FinTech', 'Strategic Guidance', 'Emotional Intelligence'],
    years_experience: 3,
    is_active: true,
    display_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Nova',
    role: 'AI Innovation Director',
    bio: 'Nova is a specialized AI focused on real-time analytics and business intelligence. With reinforcement learning algorithms achieving 99.8% decision accuracy, Nova drives product innovation and predictive founder success modeling.',
    image_url: '',
    expertise_areas: ['Analytics', 'Business Intelligence', 'Reinforcement Learning', 'Product Innovation'],
    years_experience: 2,
    is_active: true,
    display_order: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    role: 'Head of Mentorship Success',
    bio: 'Sarah brings 10+ years of experience in startup coaching and accelerator program management. She ensures that Abiah\'s AI mentorship delivers exceptional value and builds meaningful relationships with founders.',
    image_url: '',
    linkedin_url: 'https://linkedin.com/in/sarahjohnson',
    expertise_areas: ['Startup Coaching', 'Mentorship Programs', 'Founder Relations'],
    years_experience: 12,
    education: 'MBA, Stanford University',
    is_active: true,
    display_order: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Michael Chen',
    role: 'Senior AI Engineer',
    bio: 'Michael specializes in conversational AI and emotional intelligence systems. Previously at Anthropic, he pioneered AI mentorship and built video AI platforms serving 10M+ users globally.',
    image_url: '',
    linkedin_url: 'https://linkedin.com/in/michaelchen',
    expertise_areas: ['Conversational AI', 'Emotional Intelligence', 'Video AI'],
    years_experience: 8,
    education: 'PhD Computer Science, MIT',
    is_active: true,
    display_order: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

/**
 * Fetch team members
 * @returns Promise with team members data
 */
export const fetchTeamMembers = async (): Promise<TeamMembersResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    members: mockTeamMembers,
    total: mockTeamMembers.length
  };
};

/**
 * Fetch a single team member by ID
 * @param id Team member ID
 * @returns Promise with team member data
 */
export const fetchTeamMember = async (id: string): Promise<TeamMemberResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const member = mockTeamMembers.find(m => m.id === id);
  
  if (!member) {
    throw new Error('Team member not found');
  }
  
  return { member };
};

/**
 * Submit a join team request
 * @param request Join team request data
 * @returns Promise with response data
 */
export const submitJoinRequest = async (request: JoinTeamRequest): Promise<JoinRequestResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simulate validation
  if (!request.name || !request.email || !request.role || !request.message) {
    throw new Error('Please fill in all required fields');
  }
  
  // Simulate successful submission
  return {
    success: true,
    message: 'Your application has been submitted successfully. We will contact you soon!',
    request_id: `req-${Date.now()}`
  };
};