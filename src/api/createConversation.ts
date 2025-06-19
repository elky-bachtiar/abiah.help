import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { callTavusAPI } from "./tavus";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  // Get settings from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  
  // Add debug logs
  console.log('Creating conversation with settings:', settings);
  console.log('Greeting value:', settings.greeting);
  console.log('Context value:', settings.context);
  
  // Build the context string
  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. Additional context: `;
  }
  contextString += settings.context || "";
  
  const payload = {
    persona_id: settings.persona || "p6354bfc198a",
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : "Hey there! I'm your technical co-pilot! Let's get get started building with Tavus.",
    conversational_context: contextString
  };
  
  console.log('Sending payload to API:', payload);
  
  try {
    // Call Tavus API through Supabase Edge Function
    return await callTavusAPI<IConversation>(
      {
        method: 'POST',
        endpoint: '/v2/conversations',
        data: payload,
        headers: {
          "x-api-key": token ?? "",
        }
      }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
