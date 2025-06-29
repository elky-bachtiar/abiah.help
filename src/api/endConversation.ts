import { callTavusAPI } from "./tavus";
import { completeConversation, getConversationDetails } from "./conversationApi";

// Track active conversations to prevent duplicate ending
const endingConversations = new Set<string>();

export const endConversation = async (
  token: string,
  conversationId: string,
  localConversationId?: string
) => {
  try {
    // Check if we're already ending this conversation
    if (endingConversations.has(conversationId)) {
      console.log(`Already ending conversation ${conversationId}, skipping duplicate request`);
      return null;
    }
    
    // Mark this conversation as being ended
    endingConversations.add(conversationId);
    
    // End the Tavus conversation
    try {
      console.log(`Ending Tavus conversation: ${conversationId}`);
      const result = await callTavusAPI({
        method: 'POST',
        endpoint: `/v2/conversations/${conversationId}/end`,
        headers: {
          "x-api-key": token ?? "",
        }
      });
      console.log(`Successfully ended Tavus conversation: ${conversationId}`, result);
    } catch (error) {
      console.error(`Error ending Tavus conversation ${conversationId}:`, error);
      // Continue with local conversation cleanup even if Tavus API fails
    }
    
    // If we have a local conversation ID, update its status
    if (localConversationId) {
      try {
        // Get the conversation details first to calculate duration
        const conversation = await getConversationDetails(localConversationId);
        
        // Calculate duration in minutes
        const startTime = new Date(conversation.created_at).getTime();
        const endTime = new Date().getTime();
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        
        // Extract key topics from message history if available
        const keyTopics: string[] = [];
        if (conversation.message_history && conversation.message_history.length > 0) {
          // This is a simple example - in a real app, you might use NLP to extract topics
          conversation.message_history.forEach(msg => {
            if (msg.metadata?.topics) {
              keyTopics.push(...msg.metadata.topics);
            }
          });
        }
        
        // Complete the conversation
        await completeConversation(
          localConversationId,
          durationMinutes,
          Array.from(new Set(keyTopics)), // Remove duplicates
          conversation.context_data
        );
        
        console.log('Completed local conversation:', localConversationId);
      } catch (error) {
        console.error('Error completing local conversation:', error);
        // Continue even if update fails
      }
    } else {
      console.warn('No local conversation ID provided, cannot update local conversation status');
    }
    
    // Remove from tracking set
    endingConversations.delete(conversationId);
    return null;
  } catch (error) {
    console.error("Error ending conversation:", error);
    // Remove from tracking set even if there was an error
    if (conversationId) {
      endingConversations.delete(conversationId);
    }
    throw error;
  }
};
