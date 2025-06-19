import { callTavusAPI } from "./tavus";

export const endConversation = async (
  token: string,
  conversationId: string,
) => {
  try {
    await callTavusAPI({
      method: 'POST',
      endpoint: `/v2/conversations/${conversationId}/end`,
      headers: {
        "x-api-key": token ?? "",
      }
    });
    
    return null;
  } catch (error) {
    console.error("Error ending conversation:", error);
    throw error;
  }
};
