import { TAVUS_CONFIG } from '@/config/tavus';
import { callTavusAPI } from './tavus';

/**
 * Interface for Tavus Video response
 */
export interface TavusVideoResponse {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * Fetches a Tavus video by ID
 * @param videoId ID of the Tavus video to fetch
 * @param apiKey Optional API key to override the default
 * @param useTestEndpoint Whether to use the test endpoint (tavus-api-test)
 * @returns Promise with the video data
 */
export const getTavusVideo = async (
  videoId: string = TAVUS_CONFIG.VIDEO_ID,
  apiKey?: string,
  useTestEndpoint: boolean = true
): Promise<TavusVideoResponse> => {
  console.log(`[DEBUG] getTavusVideo - Fetching video with ID: ${videoId}${useTestEndpoint ? ' (using test endpoint)' : ''}`);
  
  try {
    // Call Tavus API through Supabase Edge Function
    const response = await callTavusAPI<TavusVideoResponse>(
      {
        method: 'GET',
        endpoint: `/v2/videos/${videoId}`,
        headers: apiKey ? { 'x-api-key': apiKey } : undefined
      },
      undefined, // No data for GET
      useTestEndpoint // Whether to use test endpoint
    );
    
    console.log('[DEBUG] getTavusVideo - Received video data:', response);
    return response;
  } catch (error) {
    console.error('[DEBUG] Error fetching Tavus video:', error);
    throw new Error(`Failed to fetch Tavus video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
