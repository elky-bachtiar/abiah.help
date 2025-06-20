import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Environment configuration
const TAVUS_API_KEY = Deno.env.get('TAVUS_API_KEY') || '4324be49f7bf45f0ac28606101276f78'
const TAVUS_API_URL = 'https://tavusapi.com'
const CUSTOM_LLM_URL = Deno.env.get('CUSTOM_LLM_URL') || 'https://your-project.supabase.co/functions/v1/custom-llm'

console.log("[DEBUG] Tavus API LLM Function loaded. TAVUS_API_KEY present:", !!TAVUS_API_KEY);
console.log("[DEBUG] Custom LLM URL:", CUSTOM_LLM_URL);

interface TavusRequest {
  method: 'GET' | 'POST';
  endpoint: string;
  payload?: any;
  headers?: Record<string, string>;
}

interface CustomLLMConfig {
  use_custom_llm: boolean;
  persona_id?: string;
  model?: string;
  endpoint_url?: string;
  persona_type?: 'general' | 'fintech' | 'healthtech' | 'b2b-saas' | 'enterprise';
}

interface ConversationPayload {
  persona_id: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    apply_greenscreen?: boolean;
  };
  custom_llm_url?: string;
  callback_url?: string;
}

// CORS headers with COOP and COEP support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-custom-llm-config',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Access-Control-Allow-Credentials': 'true'
}

/**
 * Create a standardized error response
 */
function createErrorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create a standardized success response
 */
function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({ data }),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Get API key from request headers or fallback to environment variable
 */
function getApiKey(req: Request): string | null {
  const apiKey = req.headers.get('x-api-key') || TAVUS_API_KEY;
  return apiKey || null;
}

/**
 * Parse custom LLM configuration from request headers
 */
function getCustomLLMConfig(req: Request): CustomLLMConfig | null {
  const configHeader = req.headers.get('x-custom-llm-config');
  if (!configHeader) return null;
  
  try {
    return JSON.parse(configHeader);
  } catch (error) {
    console.error('[ERROR] Failed to parse custom LLM config:', error);
    return null;
  }
}

/**
 * Prepare headers for Tavus API request
 */
function prepareTavusHeaders(req: Request): Record<string, string> {
  const apiKey = getApiKey(req);
  
  if (!apiKey) {
    throw new Error('Missing API key');
  }
  
  const tavusHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  };
  
  // Forward any additional headers from the request
  for (const [key, value] of req.headers.entries()) {
    if (key.toLowerCase().startsWith('tavus-') || key.toLowerCase() === 'authorization') {
      tavusHeaders[key] = value;
    }
  }
  
  return tavusHeaders;
}

/**
 * Enhance conversation payload with custom LLM configuration
 */
function enhanceConversationPayload(
  originalPayload: ConversationPayload, 
  customLLMConfig: CustomLLMConfig | null,
  userId?: string
): ConversationPayload {
  if (!customLLMConfig || !customLLMConfig.use_custom_llm) {
    return originalPayload;
  }

  console.log('[DEBUG] Enhancing conversation with custom LLM config:', customLLMConfig);

  // Build custom LLM URL with parameters
  const customLLMUrl = new URL(customLLMConfig.endpoint_url || CUSTOM_LLM_URL);
  customLLMUrl.searchParams.set('persona', customLLMConfig.persona_type || 'general');
  if (userId) {
    customLLMUrl.searchParams.set('user_id', userId);
  }
  if (customLLMConfig.model) {
    customLLMUrl.searchParams.set('model', customLLMConfig.model);
  }

  return {
    ...originalPayload,
    custom_llm_url: customLLMUrl.toString()
  };
}

/**
 * Parse response from Tavus API
 */
async function parseTavusResponse(response: Response): Promise<any> {
  const responseText = await response.text();
  console.log('[DEBUG] Tavus API response text:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
  
  try {
    return responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    // For non-JSON responses, return the text directly
    return responseText;
  }
}

/**
 * Handle GET requests to Tavus API
 */
async function handleGetRequest(req: Request): Promise<Response> {
  try {
    // Extract the endpoint path from the URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/tavus-api-llm/');
    
    if (pathParts.length < 2) {
      return createErrorResponse('Invalid endpoint path');
    }
    
    // Get the endpoint path after '/tavus-api-llm/'
    const endpointPath = pathParts[1];
    
    // Extract query parameters
    const queryParams = url.searchParams.toString();
    const tavusEndpoint = endpointPath + (queryParams ? `?${queryParams}` : '');
    
    console.log(`[DEBUG] Routing GET request to Tavus API: ${tavusEndpoint}`);
    
    // Get API headers
    let tavusHeaders;
    try {
      tavusHeaders = prepareTavusHeaders(req);
    } catch (error) {
      return createErrorResponse(error.message, 401);
    }
    
    // Call the Tavus API
    const response = await fetch(`${TAVUS_API_URL}/${tavusEndpoint}`, {
      method: 'GET',
      headers: tavusHeaders
    });
    
    console.log('[DEBUG] Tavus API response status:', response.status);
    
    // Parse and return the response
    const responseData = await parseTavusResponse(response);
    
    if (typeof responseData === 'string') {
      // Raw text response
      return new Response(responseData, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    } else {
      // JSON response
      return createSuccessResponse(responseData, response.ok ? 200 : response.status);
    }
  } catch (error) {
    console.error('[DEBUG] Error handling GET request:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Handle POST requests to Tavus API with custom LLM support
 */
async function handlePostRequest(req: Request): Promise<Response> {
  try {
    // Parse the JSON request body
    let requestBody: TavusRequest;
    try {
      requestBody = await req.json();
      console.log('[DEBUG] Request body parsed:', requestBody);
    } catch (error) {
      console.error('[DEBUG] Error parsing JSON request:', error);
      return createErrorResponse('Invalid JSON request');
    }

    // Basic validation
    if (!requestBody || !requestBody.endpoint) {
      return createErrorResponse('Missing endpoint in request');
    }

    // Get custom LLM configuration
    const customLLMConfig = getCustomLLMConfig(req);
    const userId = req.headers.get('x-user-id');

    // Enhance payload for conversation creation if custom LLM is configured
    if (requestBody.endpoint === '/v2/conversations' && requestBody.payload) {
      requestBody.payload = enhanceConversationPayload(
        requestBody.payload,
        customLLMConfig,
        userId
      );
      console.log('[DEBUG] Enhanced conversation payload:', requestBody.payload);
    }

    // Get API headers
    let tavusHeaders;
    try {
      tavusHeaders = prepareTavusHeaders(req);
    } catch (error) {
      return createErrorResponse(error.message, 401);
    }

    // Add any custom headers from the request
    if (requestBody.headers) {
      Object.assign(tavusHeaders, requestBody.headers);
    }

    console.log('[DEBUG] Calling Tavus API:', {
      url: TAVUS_API_URL + requestBody.endpoint,
      method: requestBody.method,
      customLLM: !!customLLMConfig?.use_custom_llm
    });

    // Call the Tavus API
    const response = await fetch(TAVUS_API_URL + requestBody.endpoint, {
      method: requestBody.method,
      headers: tavusHeaders,
      body: requestBody.payload ? JSON.stringify(requestBody.payload) : undefined
    });

    console.log('[DEBUG] Tavus API response status:', response.status);
    
    // Parse and return the response
    const responseData = await parseTavusResponse(response);
    
    if (typeof responseData === 'string') {
      // Raw text response
      return new Response(responseData, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    } else {
      // JSON response
      return createSuccessResponse(responseData, 200);
    }
  } catch (error) {
    console.error('[DEBUG] Edge Function error:', error);
    return createErrorResponse(error.message, 500);
  }
}

serve(async (req) => {
  console.log('[DEBUG] Tavus API LLM Function received request:', {
    method: req.method,
    url: req.url
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  } 
  // All API requests come in as POST with a JSON body specifying the actual method
  else if (req.method === 'POST') {
    try {
      console.log('[DEBUG] Processing POST request');
      
      // Parse the request body
      let requestBody: TavusRequest;
      try {
        requestBody = await req.json();
        console.log('[DEBUG] Request body parsed:', requestBody);
      } catch (error) {
        console.error('[DEBUG] Error parsing JSON request:', error);
        
        // Attempt to get the raw body as a fallback
        const rawText = await req.text();
        console.log('[DEBUG] Raw request body:', rawText);
        
        return createErrorResponse('Invalid JSON request: ' + error.message);
      }
      
      // Now process based on the method specified in the request body
      if (!requestBody || !requestBody.method) {
        return createErrorResponse('Missing method in request body');
      }
      
      // Route based on the method in the request body
      if (requestBody.method === 'GET') {
        console.log('[DEBUG] Proxying GET request to Tavus API');
        
        // Get API headers
        let tavusHeaders;
        try {
          tavusHeaders = prepareTavusHeaders(req);
        } catch (error) {
          return createErrorResponse(error.message, 401);
        }
        
        if (!requestBody.endpoint) {
          return createErrorResponse('Missing endpoint in request');
        }
        
        // Determine if the endpoint is a full URL or just a path
        let apiUrl;
        if (requestBody.endpoint.startsWith('http')) {
          // If it's a full URL, use it as is
          apiUrl = requestBody.endpoint;
        } else {
          // Otherwise, prepend the base URL
          apiUrl = `${TAVUS_API_URL}${requestBody.endpoint}`;
        }
        
        console.log(`[DEBUG] Calling API: ${apiUrl}`);
        
        // Set up headers for Tavus API
        const headers = new Headers({
          'x-api-key': TAVUS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        });
        
        // Log the headers we're sending
        console.log('[DEBUG] Request headers:', JSON.stringify(Object.fromEntries(headers), null, 2));
        
        try {
          const response = await fetch(apiUrl, {
            method: requestBody.method,
            headers: headers,
            // Only include body for non-GET requests
            ...(requestBody.method !== 'GET' && requestBody.payload && { 
              body: JSON.stringify(requestBody.payload) 
            })
          });

          console.log(`[DEBUG] Response status: ${response.status}`);
          
          // Get response headers for debugging
          const responseHeaders = Object.fromEntries(response.headers.entries());
          console.log('[DEBUG] Response headers:', JSON.stringify(responseHeaders, null, 2));

          // Get response text first to log it
          const responseText = await response.text();
          console.log('[DEBUG] Raw response:', responseText.slice(0, 500)); // Log first 500 chars

          // Try to parse as JSON, fall back to text if it fails
          let responseData;
          try {
            responseData = responseText ? JSON.parse(responseText) : null;
          } catch (e) {
            console.error('[ERROR] Failed to parse response as JSON:', e);
            responseData = responseText;
          }
          
          // If the response is not OK, include the status in the response
          if (!response.ok) {
            console.error(`[ERROR] Tavus API error: ${response.status} ${response.statusText}`, responseData);
            return new Response(JSON.stringify({
              error: 'Tavus API error',
              status: response.status,
              statusText: response.statusText,
              data: responseData
            }), {
              status: response.status,
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json'
              }
            });
          }
          
          // Successful response
          return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json'
            }
          });
          
        } catch (error) {
          console.error('[ERROR] Error calling Tavus API:', error);
          return createErrorResponse(`Failed to call Tavus API: ${error.message}`, 500);
        }
      } 
      else if (requestBody.method === 'POST') {
        // Enhanced POST logic with custom LLM support
        return await handlePostRequest(req);
      }
      else {
        return createErrorResponse(`Method ${requestBody.method} not supported in request body`);
      }
    } catch (error) {
      console.error('[DEBUG] Error processing request:', error);
      return createErrorResponse(error.message, 500);
    }
  } 
  // Direct GET requests (these should be rare)
  else if (req.method === 'GET') {
    return await handleGetRequest(req);
  }
  // Handle unsupported methods
  else {
    return createErrorResponse(
      `Method ${req.method} not supported. Supported methods are GET, POST and OPTIONS.`,
      405
    );
  }
});