import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

/**
 * Call a Supabase Edge Function securely
 * @param functionName Name of the function to call
 * @param payload Payload to send to the function
 * @returns Promise with the response data or null if no data
 */
/**
 * Fetch a Tavus welcome video by ID
 * @param videoId ID of the Tavus video to fetch
 * @returns Promise with the video data or null if not found
 */
export async function getTavusVideo(videoId: string): Promise<any | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // Construct the URL with the video_id parameter
    const url = `${supabaseUrl}/functions/v1/tavus-api/getTavusVideo?video_id=${encodeURIComponent(videoId)}`;
    
    // Get the anon key
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    // Set up request headers
    const headers: HeadersInit = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    };
    
    console.log(`[DEBUG] getTavusVideo - Fetching video with ID: ${videoId}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    console.log(`[DEBUG] getTavusVideo - Response status:`, response.status);
    
    if (!response.ok) {
      throw new Error(`Error fetching Tavus video: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error(`[DEBUG] Failed to fetch Tavus video:`, err);
    throw err;
  }
}

export async function callEdgeFunction<T = any>(
  functionName: string,
  payload?: unknown,
  headers?: Record<string, string>,
  retryCount = 0
): Promise<T | null> {
  try {
    console.log(`[DEBUG] callEdgeFunction - About to call ${functionName} with payload:`, payload);
    
    // WORKAROUND: Use fetch directly instead of supabase.functions.invoke
    // This is because supabase.functions.invoke appears to have issues sending the body
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/${functionName}`;
    
    // Get the anon key
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    // Get the auth token asynchronously if needed
    let authToken = '';
    try {
      const { data } = await supabase.auth.getSession();
      authToken = data.session?.access_token || '';
    } catch (e) {
      console.warn('[DEBUG] Failed to get auth token:', e);
    }
    
    // Set up request headers with proper auth
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      // Always provide Authorization header with anon key as Bearer token
      'Authorization': `Bearer ${anonKey}`
    };
    
    // Add custom headers if provided
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        headers[key] = value;
      });
    }
    
    // Add user auth token if available (will override the anon key in Authorization)
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    console.log(`[DEBUG] callEdgeFunction - Fetching ${url} with headers:`, {
      'Content-Type': headers['Content-Type'],
      'apikey': headers['apikey'] ? 'Present' : 'Missing',
      'Authorization': headers['Authorization'] ? 'Present' : 'Missing'
    });
    
    // Convert payload to JSON string
    const body = payload ? JSON.stringify(payload) : undefined;
    console.log(`[DEBUG] callEdgeFunction - Request body:`, body);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      // Removing credentials: 'include' to avoid CORS issues
    });
    
    console.log(`[DEBUG] callEdgeFunction - Response status:`, response.status);
    
    // Handle non-JSON responses
    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('[DEBUG] Failed to parse JSON response:', parseError);
        if (!response.ok) {
          throw new Error(`Error calling ${functionName}: ${response.status} ${response.statusText}`);
        }
        return null;
      }
    } else {
      // For non-JSON responses, just get the text
      const text = await response.text();
      console.log(`[DEBUG] Non-JSON response:`, text);
      if (!response.ok) {
        throw new Error(`Error calling ${functionName}: ${response.status} ${response.statusText}`);
      }
      return text as unknown as T;
    }
    
    console.log(`[DEBUG] callEdgeFunction - Response data:`, responseData);
    
    // Check for specific errors that we can retry
    if (!response.ok && retryCount < 2) {
      // Check for enable_llm_tools error
      if (responseData?.error?.includes('enable_llm_tools') && 
          typeof payload === 'object' && payload !== null) {
        const newPayload = structuredClone(payload);
        // Remove the problematic property if it exists
        if (newPayload.payload?.properties?.enable_llm_tools) {
          delete newPayload.payload.properties.enable_llm_tools;
          console.log('[DEBUG] Retrying without enable_llm_tools property');
          return callEdgeFunction<T>(functionName, newPayload, headers, retryCount + 1);
        }
      }
    }
    
    // If we get here, either the response was OK or we couldn't fix the error
    if (!response.ok) {
      console.error(`[DEBUG] callEdgeFunction - Error response from ${functionName}:`, responseData);
      throw new Error(
        responseData?.error || responseData?.message || `Error calling ${functionName} function`
      );
    }
    
    return responseData as T;
  } catch (err) {
    console.error(`[DEBUG] Failed to call ${functionName} function:`, err);
    throw err;
  }
}
