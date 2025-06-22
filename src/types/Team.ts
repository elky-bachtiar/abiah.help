export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  email?: string;
  expertise_areas: string[];
  years_experience: number;
  education?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface JoinTeamRequest {
  name: string;
  email: string;
  role: string;
  resume_url?: string;
  message: string;
  linkedin_url?: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
}

export interface TeamMemberResponse {
  member: TeamMember;
}

export interface JoinRequestResponse {
  success: boolean;
  message: string;
  request_id?: string;
}