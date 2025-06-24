import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { callTavusAPI, TAVUS_CONFIG } from "./tavus";
import { createConversationRecord, updateConversationWithTavusId } from "./conversationApi";

export const createConversation = async (
  userId?: string,
  title?: string
): Promise<IConversation> => {
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
  
  // If a full payload override is provided in settings, use it
  const payload = settings.payload ?? {
    // Optional: settings.replica or leave undefined for new conversation
    ...(settings.replica ? { replica_id: settings.replica } : {}),
    persona_id: settings.persona || "pebc953c8b73",
    // Add webhook URL for conversation completion
    callback_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tavus-webhook`,
    conversation_name: title || `Conversation on ${new Date().toLocaleDateString()}`,
    conversational_context: contextString,
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : "Hey there! I'm your technical co-pilot! Let's get get started building with Tavus.",
    properties: {
      // These will be undefined unless injected via settings.payload
      max_call_duration: 300,
      participant_left_timeout: 60,
      participant_absent_timeout: 120,
      enable_recording: true,
      enable_closed_captions: true,
      apply_greenscreen: false,
      language: settings.language || 'english',
      recording_s3_bucket_name: 'conversation-recordings',
      recording_s3_bucket_region: 'us-east-1',
      aws_assume_role_arn: '',
      // Enable LLM tools if configured
      enable_llm_tools: import.meta.env.VITE_ENABLE_LLM_TOOLS === 'true'
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
  if (import.meta.env.VITE_ENABLE_LLM_TOOLS === 'true') {
    customHeaders['x-tavus-enable-tools'] = 'true';
  }
  
  try {
    // Call Tavus API through Supabase Edge Function
    const tavusConversation = await callTavusAPI<IConversation>({
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
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
