// Tavus API integration for video consultations
const TAVUS_BASE_URL = 'https://api.tavus.io/v2';

export interface CreateConversationRequest {
  persona_id: string;
  greeting?: string;
  context?: string;
  callback_url?: string;
}

export interface CreateConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

export interface EndConversationRequest {
  conversation_id: string;
}

export interface GetVideoResponse {
  video_id: string;
  video_url: string;
  status: string;
  created_at: string;
}

// These functions call our Supabase Edge Functions which proxy to Tavus API
// This keeps API keys secure on the server side

export async function createConversation(request: CreateConversationRequest): Promise<CreateConversationResponse> {
  try {
    const response = await fetch('/api/tavus/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create video conversation');
  }
}

export async function endConversation(conversationId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tavus/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error ending conversation:', error);
    throw new Error('Failed to end video conversation');
  }
}

export async function getVideo(videoId: string): Promise<GetVideoResponse> {
  try {
    const response = await fetch(`/api/tavus/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting video:', error);
    throw new Error('Failed to get video details');
  }
}

// Mock implementations for development
export const mockTavusResponses = {
  createConversation: {
    conversation_id: 'conv_' + Math.random().toString(36).substring(7),
    conversation_url: 'https://tavus.video/conv_mock_123',
    status: 'active',
  } as CreateConversationResponse,

  getVideo: {
    video_id: 'e990cb0d94',
    video_url: 'https://tavus.video/e990cb0d94',
    status: 'ready',
    created_at: new Date().toISOString(),
  } as GetVideoResponse,
};

// Development mode flag
const isDevelopment = import.meta.env.DEV;

// Use mock responses in development
export async function createConversationDev(request: CreateConversationRequest): Promise<CreateConversationResponse> {
  if (isDevelopment) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockTavusResponses.createConversation;
  }
  return createConversation(request);
}

export async function getVideoDev(videoId: string): Promise<GetVideoResponse> {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTavusResponses.getVideo;
  }
  return getVideo(videoId);
}