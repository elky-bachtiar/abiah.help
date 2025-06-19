import { callEdgeFunction } from '@/lib/supabase'

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
  useTestEndpoint = false
): Promise<T> {
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

    console.log(`Calling Tavus API (${useTestEndpoint ? 'test endpoint' : 'production endpoint'}) with:`, edgeFunctionBody);
    
    // Use either test or production endpoint
    const endpoint = useTestEndpoint ? 'tavus-api-test' : 'tavus-api';
    const response = await callEdgeFunction<TavusResponse<T>>(endpoint, edgeFunctionBody);

    if (response?.error) {
      throw new Error(
        response.error + (response.details ? `: ${JSON.stringify(response.details)}` : '')
      )
    }

    return response?.data as T
  } catch (error) {
    console.error('Tavus API Error:', error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'An unknown error occurred while calling Tavus API'
    )
  }
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
