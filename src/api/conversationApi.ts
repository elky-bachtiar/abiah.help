import { supabase } from '../lib/supabase';
import { 
  ConversationSummary, 
  ConversationDetail, 
  MessageHistory, 
  ConversationContextData 
} from '../types/Conversation';

/**
 * Create a new conversation record in the database
 * @param userId User ID
 * @param title Conversation title
 * @param mentorPersona Mentor persona type
 * @param initialContext Initial context data
 * @returns Promise with the created conversation
 */
export const createConversationRecord = async (
  userId: string,
  title: string,
  mentorPersona: string = 'general',
  initialContext?: ConversationContextData
): Promise<ConversationSummary> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title,
          mentor_persona: mentorPersona,
          status: 'scheduled',
          has_transcript: false,
          has_recording: false,
          context_data: initialContext || {},
          message_history: []
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationSummary;
  } catch (error) {
    console.error('Error creating conversation record:', error);
    throw error;
  }
};

/**
 * Update conversation with Tavus conversation ID
 * @param conversationId Local conversation ID
 * @param tavusConversationId Tavus conversation ID
 * @returns Promise with the updated conversation
 */
export const updateConversationWithTavusId = async (
  conversationId: string,
  tavusConversationId: string
): Promise<ConversationSummary> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        tavus_conversation_id: tavusConversationId,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationSummary;
  } catch (error) {
    console.error('Error updating conversation with Tavus ID:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 * @param userId User ID
 * @returns Promise with array of conversations
 */
export const getConversationsForUser = async (userId: string): Promise<ConversationSummary[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ConversationSummary[];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get detailed conversation by ID
 * @param conversationId Conversation ID
 * @returns Promise with conversation details
 */
export const getConversationDetails = async (conversationId: string): Promise<ConversationDetail> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) throw error;
    
    // Convert to ConversationDetail type
    const conversation = data as ConversationDetail;
    
    // If there's no transcript but there should be, we could fetch it here
    // For now, we'll just return what we have
    
    return conversation;
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    throw error;
  }
};

/**
 * Update conversation state
 * @param conversationId Conversation ID
 * @param updates Partial conversation updates
 * @returns Promise with updated conversation
 */
export const updateConversationState = async (
  conversationId: string,
  updates: Partial<ConversationSummary>
): Promise<ConversationSummary> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationSummary;
  } catch (error) {
    console.error('Error updating conversation state:', error);
    throw error;
  }
};

/**
 * Append a message to the conversation history
 * @param conversationId Conversation ID
 * @param message Message to append
 * @returns Promise with updated conversation
 */
export const appendMessageToHistory = async (
  conversationId: string,
  message: MessageHistory
): Promise<ConversationSummary> => {
  try {
    // First, get the current message history
    const { data: currentData, error: fetchError } = await supabase
      .from('conversations')
      .select('message_history')
      .eq('id', conversationId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Append the new message to the history
    const currentHistory = currentData.message_history as MessageHistory[];
    const updatedHistory = [...currentHistory, message];
    
    // Update the conversation with the new history
    const { data, error } = await supabase
      .from('conversations')
      .update({
        message_history: updatedHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationSummary;
  } catch (error) {
    console.error('Error appending message to history:', error);
    throw error;
  }
};

/**
 * Update the entire message history
 * @param conversationId Conversation ID
 * @param messages Complete message history
 * @returns Promise with updated conversation
 */
export const updateMessageHistory = async (
  conversationId: string,
  messages: MessageHistory[]
): Promise<ConversationSummary> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        message_history: messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationSummary;
  } catch (error) {
    console.error('Error updating message history:', error);
    throw error;
  }
};

/**
 * Complete a conversation
 * @param conversationId Conversation ID
 * @param durationMinutes Duration in minutes
 * @param keyTopics Array of key topics
 * @param contextData Final context data
 * @returns Promise with completed conversation
 */
export const completeConversation = async (
  conversationId: string,
  durationMinutes: number,
  keyTopics: string[] = [],
  contextData?: ConversationContextData
): Promise<ConversationSummary> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        status: 'completed',
        duration_minutes: durationMinutes,
        key_topics: keyTopics,
        context_data: contextData || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ConversationSummary;
  } catch (error) {
    console.error('Error completing conversation:', error);
    throw error;
  }
};