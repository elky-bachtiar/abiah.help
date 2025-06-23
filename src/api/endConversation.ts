import { callTavusAPI } from "./tavus";
import { completeConversation, getConversationDetails } from "./conversationApi";

export const endConversation = async (
  token: string,
  conversationId: string,
  localConversationId?: string
) => {
  try {
    // End the Tavus conversation
    const result = await callTavusAPI({
      method: 'POST',
      endpoint: `/v2/conversations/${conversationId}/end`,
      headers: {
        "x-api-key": token ?? "",
      }
    });
    
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
    }
    
    return null;
  } catch (error) {
    console.error("Error ending conversation:", error);
    throw error;
  }
};
