import { callEdgeFunction } from '@/lib/supabase'

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://api.abiah.help';

interface TavusRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  data?: Record<string, any>
  headers?: Record<string, string>
}

interface TavusResponse<T = any> {
  data?: T
  error?: string
  details?: any
}

/**
 * Makes a request to the Tavus API through the Supabase Edge Function
 * @param options Request options including method, endpoint, and data
 * @returns Promise with the response data
 * @throws {Error} If the request fails or returns an error
 */
/**
 * Call the Tavus API using the specified Edge Function
 * @param options Request options or endpoint string
 * @param data Optional data for shorthand syntax
 * @param useTestEndpoint Whether to use the test endpoint
 * @returns API response data
 */
export async function callTavusAPI<T = any>(
  options: TavusRequestOptions | string,
  data?: Record<string, any>,
  useTestEndpoint = false,
  retryCount = 0
): Promise<T> {
  // Debug: log the input arguments
  console.log('[DEBUG] callTavusAPI called with:', { options, data, useTestEndpoint });
  // Handle shorthand syntax (just endpoint for GET, or endpoint + data)
  const requestOptions: TavusRequestOptions = typeof options === 'string' 
    ? { method: 'GET', endpoint: options, data }
    : options

  try {
    // Format the request body for the Edge Function
    const edgeFunctionBody = {
      method: requestOptions.method,
      endpoint: requestOptions.endpoint,
      payload: requestOptions.data,
      headers: requestOptions.headers
    };

    console.log(`[DEBUG] Tavus Edge Function (${useTestEndpoint ? 'test endpoint' : 'production endpoint'}) with:`, edgeFunctionBody);
    // Use either test or production endpoint
    const endpoint = useTestEndpoint ? 'tavus-api-test' : 'tavus-api';
    
    try {
      const response = await callEdgeFunction<TavusResponse<T>>(endpoint, edgeFunctionBody);
      // Debug: log the raw response from the Edge Function
      console.log('[DEBUG] Edge Function response:', response);
      if (response?.error) {
        console.error('[DEBUG] Edge Function returned error:', response.error, response.details);
        
        // Check if the error is related to enable_llm_tools
        if (response.error.includes('enable_llm_tools') && retryCount === 0) {
          console.log('[DEBUG] Detected enable_llm_tools error, retrying without this property');
          
          // Remove the problematic property and retry
          if (requestOptions.method === 'POST' && requestOptions.data?.properties) {
            const newPayload = { ...requestOptions.data };
            if (newPayload.properties && 'enable_llm_tools' in newPayload.properties) {
              delete newPayload.properties.enable_llm_tools;
              console.log('[DEBUG] Retrying without enable_llm_tools property');
              return callTavusAPI<T>(
                { ...requestOptions, data: newPayload },
                undefined,
                useTestEndpoint,
                retryCount + 1
              );
            }
          }
        }
        
        throw new Error(
          response.error + (response.details ? `: ${JSON.stringify(response.details)}` : '')
        );
      }
      
      // Debug: log the parsed data returned
      console.log('[DEBUG] Tavus API parsed data:', response?.data);
      return response?.data as T;
    } catch (error) {
      console.error('Tavus API Error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'An unknown error occurred while calling Tavus API'
      );
    }
    // Debug: log the raw response from the Edge Function
}

/**
 * Utility functions for common Tavus API operations
 */
export const tavusAPI = {
  // Video operations
  createVideo: (data: any) => 
    callTavusAPI({ method: 'POST', endpoint: '/videos' }, data),
    
  getVideo: (videoId: string) => 
    callTavusAPI({ method: 'GET', endpoint: `/videos/${videoId}` }),
    
  listVideos: (params?: Record<string, any>) => 
    callTavusAPI({ 
      method: 'GET', 
      endpoint: `/videos${params ? '?' + new URLSearchParams(params).toString() : ''}` 
    }),
    
  updateVideo: (videoId: string, data: any) => 
    callTavusAPI({ method: 'PATCH', endpoint: `/videos/${videoId}` }, data),
    
  deleteVideo: (videoId: string) => 
    callTavusAPI({ method: 'DELETE', endpoint: `/videos/${videoId}` }),
  
  // Template operations
  createTemplate: (data: any) => 
    callTavusAPI({ method: 'POST', endpoint: '/templates' }, data),
  
  getTemplate: (templateId: string) => 
    callTavusAPI({ method: 'GET', endpoint: `/templates/${templateId}` }),
  
  listTemplates: () => 
    callTavusAPI({ method: 'GET', endpoint: '/templates' }),
  
  // Add more Tavus API endpoints as needed
}
