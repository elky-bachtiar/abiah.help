import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

console.log("[DEBUG] Custom LLM Function loaded. OpenAI API Key present:", !!OPENAI_API_KEY);
console.log("[DEBUG] Custom LLM Function loaded. Anthropic API Key present:", !!ANTHROPIC_API_KEY);

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

/**
 * Create a standardized error response
 */
function createErrorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ 
      error: {
        message,
        type: 'custom_llm_error',
        code: status
      }
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Get startup context and persona-specific system prompt
 */
function getPersonaSystemPrompt(persona: string, userContext?: any): string {
  const basePrompt = `You are an AI mentor for startup founders, providing guidance through video consultation. You should be:
- Emotionally intelligent and supportive
- Industry-specific in your expertise
- Practical and actionable in your advice
- Empathetic to founder challenges
- Brief but comprehensive in responses (suitable for video conversation)`;

  const personaPrompts = {
    'general': `${basePrompt}
You are a general startup mentor with broad experience across industries. Focus on fundamental business principles, strategy, and common founder challenges.`,
    
    'fintech': `${basePrompt}
You specialize in FinTech startups. You understand regulatory compliance, financial services, payment systems, and the unique challenges of building trust in financial products.`,
    
    'healthtech': `${basePrompt}
You specialize in HealthTech startups. You understand HIPAA compliance, healthcare regulations, clinical workflows, and the unique challenges of healthcare innovation.`,
    
    'b2b-saas': `${basePrompt}
You specialize in B2B SaaS startups. You understand enterprise sales, customer success, product-market fit for business customers, and scaling challenges.`,
    
    'enterprise': `${basePrompt}
You specialize in enterprise-focused startups. You understand complex sales cycles, stakeholder management, compliance requirements, and enterprise customer needs.`
  };

  return personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.general;
}

/**
 * Extract context from conversation history to maintain continuity
 */
function extractConversationContext(messages: ChatMessage[]): string {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const assistantMessages = messages.filter(msg => msg.role === 'assistant');
  
  // Build context summary
  const context = {
    conversation_length: messages.length,
    topics_discussed: userMessages.slice(-3).map(msg => msg.content.substring(0, 100)),
    last_advice_given: assistantMessages.slice(-1)[0]?.content?.substring(0, 200)
  };
  
  return `Previous conversation context: ${JSON.stringify(context)}`;
}

/**
 * Call OpenAI API for chat completion
 */
async function callOpenAI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: request.model || 'gpt-4-turbo-preview',
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 500, // Shorter responses for video conversation
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  return await response.json();
}

/**
 * Call Anthropic Claude API for chat completion
 */
async function callClaude(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // Convert OpenAI format to Anthropic format
  const systemMessage = request.messages.find(msg => msg.role === 'system');
  const conversationMessages = request.messages.filter(msg => msg.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: request.max_tokens || 500,
      system: systemMessage?.content || '',
      messages: conversationMessages
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const claudeResponse = await response.json();

  // Convert Anthropic response to OpenAI format
  return {
    id: `custom-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: request.model || 'claude-3-sonnet',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: claudeResponse.content[0].text
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: claudeResponse.usage?.input_tokens || 0,
      completion_tokens: claudeResponse.usage?.output_tokens || 0,
      total_tokens: (claudeResponse.usage?.input_tokens || 0) + (claudeResponse.usage?.output_tokens || 0)
    }
  };
}

/**
 * Main request handler
 */
serve(async (req) => {
  console.log('[DEBUG] Custom LLM Function received request:', {
    method: req.method,
    url: req.url
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Parse request body
    const requestBody: ChatCompletionRequest = await req.json();
    console.log('[DEBUG] Chat completion request:', {
      model: requestBody.model,
      messageCount: requestBody.messages?.length
    });

    // Validate request
    if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
      return createErrorResponse('Missing or invalid messages array');
    }

    // Extract persona from headers or URL params
    const url = new URL(req.url);
    const persona = url.searchParams.get('persona') || 'general';
    const userId = url.searchParams.get('user_id');

    console.log('[DEBUG] Processing request for persona:', persona);

    // Enhance the system message with persona-specific context
    const conversationContext = extractConversationContext(requestBody.messages);
    const personaSystemPrompt = getPersonaSystemPrompt(persona);
    
    // Modify messages to include enhanced system prompt
    const enhancedMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `${personaSystemPrompt}\n\n${conversationContext}\n\nRemember: Keep responses conversational and suitable for video consultation (aim for 30-60 seconds of speaking time).`
      },
      ...requestBody.messages.filter(msg => msg.role !== 'system')
    ];

    // Determine which AI service to use based on model or configuration
    let response: ChatCompletionResponse;
    
    if (requestBody.model?.includes('claude') || requestBody.model?.includes('anthropic')) {
      console.log('[DEBUG] Using Anthropic Claude');
      response = await callClaude({
        ...requestBody,
        messages: enhancedMessages
      });
    } else {
      console.log('[DEBUG] Using OpenAI GPT');
      response = await callOpenAI({
        ...requestBody,
        messages: enhancedMessages
      });
    }

    console.log('[DEBUG] AI response generated successfully');

    // Log usage for analytics
    console.log('[DEBUG] Usage stats:', {
      persona,
      userId,
      model: response.model,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens
    });

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[ERROR] Custom LLM Function error:', error);
    return createErrorResponse(error.message, 500);
  }
});