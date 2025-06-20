import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Hardcode API key for testing purposes only
// NEVER do this in production code
const TAVUS_API_KEY = Deno.env.get('TAVUS_API_KEY') || '4324be49f7bf45f0ac28606101276f78'
const TAVUS_API_URL = 'https://tavusapi.com'

console.log("[DEBUG] Edge Function loaded. TAVUS_API_KEY present:", !!TAVUS_API_KEY);

interface TavusRequest {
  method: string
  endpoint: string
  payload?: any
  headers?: Record<string, string>
}

// Simple CORS headers like in the send-email function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  console.log('[DEBUG] Edge Function received request:', {
    method: req.method,
    url: req.url
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log headers for debugging
    console.log('[DEBUG] Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Parse the request body
    let requestBody: TavusRequest;
    try {
      requestBody = await req.json();
      console.log('[DEBUG] Request body parsed:', requestBody);
    } catch (error) {
      console.error('[DEBUG] Error parsing JSON request:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Basic validation
    if (!requestBody || !requestBody.endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint in request' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare headers for Tavus API request
    const tavusHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': TAVUS_API_KEY
    };

    // Add any custom headers from the request
    if (requestBody.headers) {
      Object.assign(tavusHeaders, requestBody.headers);
    }

    console.log('[DEBUG] Calling Tavus API:', {
      url: TAVUS_API_URL + requestBody.endpoint,
      method: requestBody.method
    });

    // Call the Tavus API
    const response = await fetch(TAVUS_API_URL + requestBody.endpoint, {
      method: requestBody.method,
      headers: tavusHeaders,
      body: requestBody.payload ? JSON.stringify(requestBody.payload) : undefined
    });

    console.log('[DEBUG] Tavus API response status:', response.status);
    console.log('[DEBUG] Tavus API response headers:', Object.fromEntries(response.headers.entries()));

    // Get response as text first
    const responseText = await response.text();
    console.log('[DEBUG] Tavus API response text:', responseText);

    // Try to parse as JSON
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      // Return raw text if not JSON
      return new Response(
        responseText,
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    // Return the JSON response
    return new Response(
      JSON.stringify({ data: responseData }),
      { 
        status: 200,  // Always return 200 from the Edge Function
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[DEBUG] Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

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
    const pathParts = url.pathname.split('/tavus-api/');
    
    if (pathParts.length < 2) {
      return createErrorResponse('Invalid endpoint path');
    }
    
    // Get the endpoint path after '/tavus-api/'
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
 * Handle POST requests to Tavus API
 */
async function handlePostRequest(req: Request, requestBody: TavusRequest): Promise<Response> {
  try {
    console.log('[DEBUG] Request body parsed:', requestBody);

    // Basic validation
    if (!requestBody || !requestBody.endpoint) {
      return createErrorResponse('Missing endpoint in request');
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

    // Extra debug: log the full payload, endpoint, and headers
    console.log('[DEBUG] Tavus API request details:', {
      endpoint: requestBody.endpoint,
      method: requestBody.method,
      payload: requestBody.payload,
      headers: tavusHeaders
    });

    // Check for API key presence
    if (!tavusHeaders['x-api-key'] || tavusHeaders['x-api-key'] === 'undefined') {
      console.error('[ERROR] Tavus API key is missing or undefined!');
    }

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
