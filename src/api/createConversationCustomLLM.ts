import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { 
  callTavusCustomLLMAPI, 
  defaultCustomLLMConfigs, 
  type CustomLLMConfig 
} from "./tavusCustomLLM";

interface CreateConversationOptions {
  token: string;
  useCustomLLM?: boolean;
  customLLMConfig?: CustomLLMConfig;
  userId?: string;
}

export const createConversationWithCustomLLM = async (
  options: CreateConversationOptions
): Promise<IConversation> => {
  const { token, useCustomLLM = true, customLLMConfig, userId } = options;
  
  // Get settings from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  
  // Add debug logs
  console.log('Creating conversation with custom LLM settings:', settings);
  console.log('Custom LLM enabled:', useCustomLLM);
  console.log('Custom LLM config:', customLLMConfig);
  
  // Build the context string
  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. Additional context: `;
  }
  contextString += settings.context || "";
  
  // Determine persona type from settings
  const personaType = determinePersonaType(settings.persona);
  
  // Use provided config or default based on persona
  const finalCustomLLMConfig = customLLMConfig || 
    (useCustomLLM ? defaultCustomLLMConfigs[personaType] : null);
  
  const payload = {
    persona_id: settings.persona || "p6354bfc198a",
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : generatePersonalizedGreeting(personaType, settings.name),
    conversational_context: contextString,
    properties: {
      max_call_duration: 1800, // 30 minutes
      participant_left_timeout: 60,
      participant_absent_timeout: 300,
      apply_greenscreen: false
    }
  };
  
  console.log('Sending payload to custom LLM API:', payload);
  console.log('Using custom LLM config:', finalCustomLLMConfig);
  
  try {
    if (useCustomLLM && finalCustomLLMConfig) {
      // Call enhanced Tavus API with custom LLM support
      return await callTavusCustomLLMAPI<IConversation>({
        method: 'POST',
        endpoint: '/v2/conversations',
        data: payload,
        headers: {
          "x-api-key": token ?? "",
        },
        customLLMConfig: finalCustomLLMConfig,
        userId
      });
    } else {
      // Fallback to standard Tavus API
      const { callTavusAPI } = await import('./tavus');
      return await callTavusAPI<IConversation>({
        method: 'POST',
        endpoint: '/v2/conversations',
        data: payload,
        headers: {
          "x-api-key": token ?? "",
        }
      });
    }
  } catch (error) {
    console.error('Error creating conversation with custom LLM:', error);
    throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Determine persona type from persona ID or string
 */
function determinePersonaType(persona: string): string {
  const personaMap: Record<string, string> = {
    'p6354bfc198a': 'general',
    'fintech': 'fintech',
    'healthtech': 'healthtech',
    'b2b-saas': 'b2b-saas',
    'enterprise': 'enterprise'
  };
  
  return personaMap[persona] || 'general';
}

/**
 * Generate personalized greeting based on persona type
 */
function generatePersonalizedGreeting(personaType: string, userName?: string): string {
  const greetings = {
    general: `Hey ${userName || 'there'}! I'm your AI startup mentor. I'm here to help you navigate the challenges of building a successful startup. What's on your mind today?`,
    
    fintech: `Hello ${userName || 'there'}! I'm your FinTech mentor. I specialize in financial services, regulatory compliance, and payment systems. Let's discuss your FinTech venture!`,
    
    healthtech: `Hi ${userName || 'there'}! I'm your HealthTech advisor. I understand HIPAA compliance, healthcare regulations, and clinical workflows. How can I help with your health innovation?`,
    
    'b2b-saas': `Welcome ${userName || 'there'}! I'm your B2B SaaS mentor. I focus on enterprise sales, customer success, and scaling SaaS businesses. What challenges are you facing?`,
    
    enterprise: `Greetings ${userName || 'there'}! I'm your enterprise startup advisor. I specialize in complex sales cycles, stakeholder management, and enterprise customer needs. Let's talk strategy!`
  };
  
  return greetings[personaType as keyof typeof greetings] || greetings.general;
}

/**
 * Create conversation with automatic persona detection and custom LLM
 */
export const createSmartConversation = async (
  token: string,
  userContext?: {
    industry?: string;
    stage?: string;
    challenges?: string[];
    goals?: string[];
  },
  userId?: string
): Promise<IConversation> => {
  // Determine best persona based on user context
  const personaType = detectOptimalPersona(userContext);
  
  // Get corresponding custom LLM config
  const customLLMConfig = {
    ...defaultCustomLLMConfigs[personaType],
    // Add context-specific model selection
    model: selectOptimalModel(userContext) as any
  };
  
  return createConversationWithCustomLLM({
    token,
    useCustomLLM: true,
    customLLMConfig,
    userId
  });
};

/**
 * Detect optimal persona based on user context
 */
function detectOptimalPersona(userContext?: {
  industry?: string;
  stage?: string;
  challenges?: string[];
  goals?: string[];
}): string {
  if (!userContext?.industry) return 'general';
  
  const industry = userContext.industry.toLowerCase();
  
  if (industry.includes('fintech') || industry.includes('finance') || industry.includes('payment')) {
    return 'fintech';
  }
  
  if (industry.includes('health') || industry.includes('medical') || industry.includes('biotech')) {
    return 'healthtech';
  }
  
  if (industry.includes('saas') || industry.includes('software') || industry.includes('b2b')) {
    return 'b2b-saas';
  }
  
  if (industry.includes('enterprise') || userContext.stage === 'series-a' || userContext.stage === 'series-b') {
    return 'enterprise';
  }
  
  return 'general';
}

/**
 * Select optimal AI model based on context
 */
function selectOptimalModel(userContext?: {
  industry?: string;
  stage?: string;
  challenges?: string[];
  goals?: string[];
}): string {
  // Use Claude for complex reasoning tasks or healthcare
  if (userContext?.industry?.includes('health') || 
      userContext?.challenges?.some(c => c.includes('complex') || c.includes('regulation'))) {
    return 'claude-3-sonnet';
  }
  
  // Use GPT-4 for general business advice and technical discussions
  return 'gpt-4-turbo';
}