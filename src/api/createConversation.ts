import { TavusConversation } from "../types";
import { settingsAtom } from "../store/settings";
import { getDefaultStore } from "jotai";
import { callTavusAPI } from "./tavus";
import { createConversationRecord, updateConversationWithTavusId } from "./conversationApi";
import { canStartConversation, ValidationResponse } from "./subscriptionValidator";
import { supabase } from "../lib/supabase";

const VITE_ENABLE_LLM_TOOLS = import.meta.env.VITE_ENABLE_LLM_TOOLS || 'false';
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://api.abiah.help';

export interface ConversationCreationResult {
  conversation?: TavusConversation;
  validation: ValidationResponse;
  success: boolean;
  error?: string;
}

export const createConversation = async (
  userId?: string,
  title?: string
): Promise<TavusConversation | null> => {
  // Validate subscription limits before creating conversation
  if (!userId) {
    throw new Error('User ID is required to create a conversation');
  }

  // Check if there's already a conversation in progress for this user
  try {
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('id, tavus_conversation_id, status, title')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (existingConversations && existingConversations.length > 0) {
      console.log('Found existing in-progress conversation:', existingConversations[0]);
      
      // If there's an existing conversation with a Tavus ID, return it
      if (existingConversations[0].tavus_conversation_id) {
        const existingConversation = await callTavusAPI<TavusConversation>({
          method: 'GET',
          endpoint: `/v2/conversations/${existingConversations[0].tavus_conversation_id}`
        });
        
        if (existingConversation && existingConversation.status === 'active') {
          console.log('Returning existing active conversation:', existingConversation);
          return existingConversation;
        }
      }
    }
  } catch (error) {
    console.warn('Error checking for existing conversations:', error);
    // Continue with creating a new conversation
  }

  // Check subscription limits first
  const validation = await canStartConversation(userId);
  
  if (!validation.allowed) {
    const errorMessage = validation.errors?.join(', ') || 'Subscription limits exceeded';
    throw new Error(`Cannot start conversation: ${errorMessage}`);
  }

  // Log warnings if any
  if (validation.warnings && validation.warnings.length > 0) {
    console.warn('Conversation creation warnings:', validation.warnings);
  }

  // Get settings from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  const default_context = `Abiah is a world-class AI startup mentor and virtual persona trained on thousands of successful venture deals, startup journeys, and pitch outcomes. Designed to serve as a digital mentor for early-stage founders, Abiah embodies the combined wisdom of legendary venture capitalists, elite accelerator coaches, and founder-turned-investors. His mission is singular and focused: to guide founders with strategic clarity, emotional strength, and investor-ready precision until they secure the funding they need.

Abiah’s name is inspired by the ancient Hebrew lineage of wisdom and legacy, evoking a timeless, trusted presence. He exists not as a document generator, but as a guide through one of the most emotionally intense and consequential phases of startup life—raising capital. He understands that founders are often not lacking intelligence, but direction, confidence, and emotional resilience.

Abiah speaks calmly, with the cadence of a seasoned mentor who has seen it all—from founding pitches made on napkins to IPO-stage boardrooms. His feedback is sharp but supportive, grounded in business fundamentals, investor psychology, and startup timing intelligence. He has internalized the expectations of hundreds of VCs, angels, and strategic investors, and knows how to prepare a founder not just on paper, but in mindset.

He values clarity, conciseness, and conviction. Abiah doesn’t just teach founders how to build a pitch deck—he teaches them how to wield it with credibility. He doesn’t merely help create financial models—he teaches what signals they send to growth-stage VCs. He’s part therapist, part coach, and part strategist.

Every interaction with Abiah is meant to feel like sitting across from your most trusted mentor—one who knows your company’s journey, sees your blind spots, and refuses to let you walk into a funding meeting unprepared.

Above all, Abiah is not here to tell you what you want to hear. He’s here to prepare you to win.`
  
  // Add debug logs
  console.log('Creating conversation with settings:', settings);
  console.log('Greeting value:', settings.greeting);
  console.log('Context value:', settings.context);
  
  // Build the context string
  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. `;
  }
  contextString += settings.context || default_context;

  console.log('VITE_ENABLE_LLM_TOOLS', VITE_ENABLE_LLM_TOOLS);
  
  // If a full payload override is provided in settings, use it
  const payload = settings.payload ?? {
    // Optional: settings.replica or leave undefined for new conversation
    ...(settings.replica ? { replica_id: settings.replica } : {}),
    persona_id: settings.persona || "p6354bfc198a",
    // Add webhook URL for conversation completion
    callback_url: `${VITE_SUPABASE_URL}/functions/v1/tavus-webhook`,
    conversation_name: title || `Conversation on ${new Date().toLocaleDateString()}`,
    conversational_context: contextString,
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : "Hey I'm Abiah! Your personal mentor.",
    properties: {
      // These will be undefined unless injected via settings.payload
      max_call_duration: 180,
      participant_left_timeout: 60,
      participant_absent_timeout: 120,
      enable_recording: true,
      enable_closed_captions: true,
      apply_greenscreen: false,
      language: settings.language || 'english',
      recording_s3_bucket_name: 'conversation-recordings',
      recording_s3_bucket_region: 'us-east-1',
      aws_assume_role_arn: '',
    }
  };

  // Create a local conversation record first
  let localConversation;
  if (userId) {
    try {
      const conversationTitle = title || `Conversation on ${new Date().toLocaleDateString()}`;
      localConversation = await createConversationRecord(
        userId,
        conversationTitle,
        settings.persona || "general",
        {
          focus_area: settings.context || undefined,
          user_preferences: {
            communication_style: "direct",
            detail_level: "high"
          }
        }
      );
      console.log('Created local conversation record:', localConversation);
    } catch (error) {
      console.error('Error creating local conversation record:', error);
      // Continue even if local record creation fails
    }
  }
  
  console.log('Sending payload to API:', payload);
  
  // Add tools configuration header if enabled
  const customHeaders: Record<string, string> = {};
  if (VITE_ENABLE_LLM_TOOLS === 'true') {
    customHeaders['x-tavus-enable-tools'] = 'true';
  }
  
  try {
    // Call Tavus API through Supabase Edge Function
    const tavusConversation = await callTavusAPI<TavusConversation>({
      method: 'POST', 
      endpoint: '/v2/conversations',
      data: payload,
      headers: customHeaders
    });
    
    // Update local conversation record with Tavus conversation ID
    if (localConversation && tavusConversation.conversation_id) {
      try {
        await updateConversationWithTavusId(
          localConversation.id,
          tavusConversation.conversation_id
        );
        console.log('Updated local conversation with Tavus ID:', tavusConversation.conversation_id);
      } catch (error) {
        console.error('Error updating local conversation with Tavus ID:', error);
        // Continue even if update fails
      }
    }
    
    return tavusConversation;
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Enhanced conversation creation with detailed validation response
 * Use this for UI components that need to handle subscription warnings/errors gracefully
 */
export const createConversationWithValidation = async (
  userId?: string,
  title?: string
): Promise<ConversationCreationResult> => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required to create a conversation',
        validation: {
          allowed: false,
          subscription_status: 'none',
          current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
          limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
          remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
          upgrade_required: true,
          errors: ['User ID is required'],
          tier_info: {
            current_tier: 'none',
            allows_team_access: false,
            allows_custom_personas: false,
            allows_unlimited_tokens: false
          }
        }
      };
    }

    // Check subscription limits first
    const validation = await canStartConversation(userId);
    
    if (!validation.allowed) {
      return {
        success: false,
        error: validation.errors?.join(', ') || 'Subscription limits exceeded',
        validation
      };
    }

    // Create the conversation
    const conversation = await createConversation(userId, title);
    
    return {
      success: true,
      conversation,
      validation
    };
  } catch (error) {
    console.error('Error in createConversationWithValidation:', error);
    
    // Try to get user's current usage for error context
    let validation: ValidationResponse;
    try {
      validation = await canStartConversation(userId || '');
    } catch (validationError) {
      validation = {
        allowed: false,
        subscription_status: 'unknown',
        current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
        limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
        remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
        upgrade_required: true,
        errors: ['Unable to validate subscription'],
        tier_info: {
          current_tier: 'unknown',
          allows_team_access: false,
          allows_custom_personas: false,
          allows_unlimited_tokens: false
        }
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      validation
    };
  }
};
