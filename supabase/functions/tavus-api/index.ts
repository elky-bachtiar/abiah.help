import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface CreateConversationRequest {
  persona_id: string;
  greeting?: string;
  context?: string;
  callback_url?: string;
}

interface EndConversationRequest {
  conversation_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Get Tavus API key from environment
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    if (!tavusApiKey) {
      throw new Error('TAVUS_API_KEY environment variable is not set');
    }

    const tavusHeaders = {
      'Authorization': `Bearer ${tavusApiKey}`,
      'Content-Type': 'application/json',
    };

    // Route: Create Conversation
    if (path === '/tavus-api/conversations' && method === 'POST') {
      const body: CreateConversationRequest = await req.json();
      
      const response = await fetch('https://api.tavus.io/v2/conversations', {
        method: 'POST',
        headers: tavusHeaders,
        body: JSON.stringify({
          persona_id: body.persona_id,
          greeting: body.greeting,
          context: body.context,
          callback_url: body.callback_url,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavus API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: End Conversation
    if (path.startsWith('/tavus-api/conversations/') && path.endsWith('/end') && method === 'POST') {
      const conversationId = path.split('/')[3];
      
      const response = await fetch(`https://api.tavus.io/v2/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: tavusHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavus API error: ${response.status} ${errorText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: Get Video
    if (path.startsWith('/tavus-api/videos/') && method === 'GET') {
      const videoId = path.split('/')[3];
      
      const response = await fetch(`https://api.tavus.io/v2/videos/${videoId}`, {
        method: 'GET',
        headers: tavusHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavus API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route not found
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Tavus API proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});