import { callEdgeFunction } from '@/lib/supabase'

interface CustomLLMConfig {
  use_custom_llm: boolean;
  persona_type: 'general' | 'fintech' | 'healthtech' | 'b2b-saas' | 'enterprise';
  model?: 'gpt-4-turbo' | 'claude-3-sonnet' | 'custom';
  endpoint_url?: string;
}

interface TavusCustomLLMRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  data?: Record<string, any>
  headers?: Record<string, string>
  customLLMConfig?: CustomLLMConfig
  userId?: string
}

interface TavusResponse<T = any> {
  data?: T
  error?: string
  details?: any
}

/**
 * Makes a request to the Tavus API through the enhanced Supabase Edge Function with custom LLM support
 * @param options Request options including method, endpoint, data, and custom LLM configuration
 * @returns Promise with the response data
 * @throws {Error} If the request fails or returns an error
 */
export async function callTavusCustomLLMAPI<T = any>(
  options: TavusCustomLLMRequestOptions
): Promise<T> {
  try {
    // Format the request body for the Edge Function
    const edgeFunctionBody = {
      method: options.method,
      endpoint: options.endpoint,
      payload: options.data,
      headers: options.headers
    };

    // Prepare headers with custom LLM configuration
    const requestHeaders: Record<string, string> = {};
    
    if (options.customLLMConfig) {
      requestHeaders['x-custom-llm-config'] = JSON.stringify(options.customLLMConfig);
    }
    
    if (options.userId) {
      requestHeaders['x-user-id'] = options.userId;
    }

    console.log('Calling Tavus API with custom LLM support:', {
      ...edgeFunctionBody,
      customLLM: !!options.customLLMConfig?.use_custom_llm,
      persona: options.customLLMConfig?.persona_type
    });
    
    // Use the enhanced tavus-api-llm endpoint
    const response = await callEdgeFunction<TavusResponse<T>>(
      'tavus-api-llm', 
      edgeFunctionBody,
      requestHeaders
    );

    if (response?.error) {
      throw new Error(
        response.error + (response.details ? `: ${JSON.stringify(response.details)}` : '')
      )
    }

    return response?.data as T
  } catch (error) {
    console.error('Tavus Custom LLM API Error:', error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'An unknown error occurred while calling Tavus API with custom LLM'
    )
  }
}

/**
 * Enhanced utility functions for Tavus API operations with custom LLM support
 */
export const tavusCustomLLMAPI = {
  // Enhanced conversation operations with custom LLM
  createConversationWithCustomLLM: (
    data: any, 
    customLLMConfig: CustomLLMConfig,
    userId?: string
  ) => 
    callTavusCustomLLMAPI({ 
      method: 'POST', 
      endpoint: '/v2/conversations',
      data,
      customLLMConfig,
      userId
    }),
    
  // Standard operations (fallback to regular API)
  getVideo: (videoId: string) => 
    callTavusCustomLLMAPI({ method: 'GET', endpoint: `/v2/videos/${videoId}` }),
    
  endConversation: (conversationId: string) => 
    callTavusCustomLLMAPI({ 
      method: 'POST', 
      endpoint: `/v2/conversations/${conversationId}/end` 
    }),
    
  getConversation: (conversationId: string) => 
    callTavusCustomLLMAPI({ 
      method: 'GET', 
      endpoint: `/v2/conversations/${conversationId}` 
    }),

  // Persona operations with custom LLM support
  listPersonas: () => 
    callTavusCustomLLMAPI({ method: 'GET', endpoint: '/v2/personas' }),
    
  createPersonaWithCustomLLM: (
    data: any, 
    customLLMConfig: CustomLLMConfig
  ) => 
    callTavusCustomLLMAPI({ 
      method: 'POST', 
      endpoint: '/v2/personas',
      data: {
        ...data,
        custom_llm_url: customLLMConfig.endpoint_url
      },
      customLLMConfig
    })
}

/**
 * Default custom LLM configurations for different personas
 */
export const defaultCustomLLMConfigs: Record<string, CustomLLMConfig> = {
  general: {
    use_custom_llm: true,
    persona_type: 'general',
    model: 'gpt-4-turbo'
  },
  fintech: {
    use_custom_llm: true,
    persona_type: 'fintech',
    model: 'gpt-4-turbo'
  },
  healthtech: {
    use_custom_llm: true,
    persona_type: 'healthtech',
    model: 'claude-3-sonnet'
  },
  'b2b-saas': {
    use_custom_llm: true,
    persona_type: 'b2b-saas',
    model: 'gpt-4-turbo'
  },
  enterprise: {
    use_custom_llm: true,
    persona_type: 'enterprise',
    model: 'claude-3-sonnet'
  }
};

export type { CustomLLMConfig, TavusCustomLLMRequestOptions };