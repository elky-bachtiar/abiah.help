/**
 * Tavus Integration Example
 * 
 * This file demonstrates how to use the enhanced Tavus implementation
 * with webhooks, LLM tools, and custom AI integration.
 */

import { createConversation } from '../src/api/createConversation';
import { callTavusAPI } from '../src/api/tavus';

// Example 1: Basic Conversation Creation
export async function createBasicConversation() {
  try {
    const conversation = await createConversation(
      'user_123',
      'Startup Strategy Session'
    );
    
    console.log('Conversation created:', conversation);
    return conversation;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
}

// Example 2: Advanced Conversation with Custom LLM
export async function createAdvancedConversation() {
  const payload = {
    replica_id: "r79e1c033f",
    persona_id: "pebc953c8b73",
    callback_url: "https://your-project.supabase.co/functions/v1/tavus-webhook",
    conversation_name: "FinTech Mentor Session",
    conversational_context: `You are a specialized FinTech startup mentor with deep expertise in:
    - Financial services regulations (PCI DSS, SOX, GDPR)
    - Payment systems and banking partnerships
    - Fundraising for financial products
    - Building trust and credibility in finance
    - Scaling financial technology solutions`,
    custom_greeting: "Hello! I'm your FinTech mentor. Let's discuss your financial technology startup and how we can overcome the unique challenges in this industry.",
    properties: {
      max_call_duration: 3600,
      participant_left_timeout: 60,
      participant_absent_timeout: 300,
      enable_recording: true,
      enable_closed_captions: true,
      apply_greenscreen: false,
      language: "english",
      enable_llm_tools: true
    }
  };

  const customHeaders = {
    'x-custom-llm-config': JSON.stringify({
      use_custom_llm: true,
      persona_type: 'fintech',
      model: 'gpt-4-turbo',
      endpoint_url: 'https://your-project.supabase.co/functions/v1/custom-llm'
    }),
    'x-user-id': 'user_123'
  };

  try {
    const conversation = await callTavusAPI({
      method: 'POST',
      endpoint: '/v2/conversations',
      data: payload,
      headers: customHeaders
    });

    console.log('Advanced conversation created:', conversation);
    return conversation;
  } catch (error) {
    console.error('Failed to create advanced conversation:', error);
    throw error;
  }
}

// Example 3: Execute LLM Tool Directly
export async function executePitchDeckGeneration() {
  const toolRequest = {
    toolName: 'generate_pitch_deck',
    parameters: {
      company_name: 'PayFlow',
      business_idea: 'AI-powered payment optimization for small businesses',
      target_market: 'Small to medium businesses with $1M-$50M annual revenue',
      funding_amount: '$2M Series A',
      industry: 'FinTech',
      stage: 'mvp'
    },
    consultationId: 'consultation_456',
    conversationId: 'c6174952b'
  };

  try {
    const result = await callTavusAPI({
      method: 'POST',
      endpoint: '/tools/execute',
      data: toolRequest
    });

    console.log('Pitch deck generated:', result);
    return result;
  } catch (error) {
    console.error('Failed to generate pitch deck:', error);
    throw error;
  }
}

// Example 4: Webhook Event Handler Usage
export interface WebhookEventHandler {
  onConversationStarted: (conversationId: string) => void;
  onConversationEnded: (conversationId: string, reason?: string) => void;
  onTranscriptionReady: (conversationId: string, transcript: any[], analysis: any) => void;
  onToolCallExecuted: (conversationId: string, toolName: string, result: any) => void;
  onPerceptionEvent: (conversationId: string, visualContext: string, detectedObjects: string[]) => void;
  onLiveInteraction: (conversationId: string, interactionType: string, data: any) => void;
}

export function createWebhookEventHandler(): WebhookEventHandler {
  return {
    onConversationStarted: (conversationId: string) => {
      console.log(`Conversation ${conversationId} started`);
      // Update UI to show active status
      // Send notifications to relevant users
    },

    onConversationEnded: (conversationId: string, reason?: string) => {
      console.log(`Conversation ${conversationId} ended. Reason: ${reason}`);
      // Update UI to show completed status
      // Trigger post-conversation workflows
    },

    onTranscriptionReady: (conversationId: string, transcript: any[], analysis: any) => {
      console.log(`Transcript ready for conversation ${conversationId}`);
      console.log('Analysis:', analysis);
      
      // Process conversation insights
      if (analysis.keyTopics.includes('funding')) {
        console.log('Funding discussion detected - suggesting pitch deck generation');
      }
      
      if (analysis.conversationQuality.score > 80) {
        console.log('High quality conversation - excellent mentorship session');
      }
    },

    onToolCallExecuted: (conversationId: string, toolName: string, result: any) => {
      console.log(`Tool ${toolName} executed for conversation ${conversationId}`);
      console.log('Result:', result);
      
      // Notify user of generated documents
      // Update UI with new document links
    },

    onPerceptionEvent: (conversationId: string, visualContext: string, detectedObjects: string[]) => {
      console.log(`Perception event in conversation ${conversationId}`);
      console.log('Visual context:', visualContext);
      console.log('Detected objects:', detectedObjects);
      
      // Process visual information
      // Update conversation context based on what was seen
    },

    onLiveInteraction: (conversationId: string, interactionType: string, data: any) => {
      console.log(`Live interaction ${interactionType} in conversation ${conversationId}`);
      console.log('Data:', data);
      
      // Handle real-time conversation control
      // Log interaction events for analysis
    }
  };
}

// Example 5: Real-time Conversation Monitoring
export async function setupConversationMonitoring(userId: string) {
  // This would typically be in a React component
  // Using Supabase real-time subscriptions
  
  const conversationChannel = `user-${userId}`;
  
  console.log(`Setting up real-time monitoring for channel: ${conversationChannel}`);
  
  // Example of how you'd handle real-time updates
  const eventHandler = createWebhookEventHandler();
  
  // Simulate real-time event processing
  const simulateEvents = () => {
    // These would come from actual Supabase real-time subscriptions
    setTimeout(() => eventHandler.onConversationStarted('c6174952b'), 1000);
    setTimeout(() => eventHandler.onToolCallExecuted('c6174952b', 'generate_pitch_deck', { documentId: 'doc_123' }), 5000);
    setTimeout(() => eventHandler.onTranscriptionReady('c6174952b', [], { 
      keyTopics: ['funding', 'product'],
      conversationQuality: { score: 87 }
    }), 10000);
    setTimeout(() => eventHandler.onConversationEnded('c6174952b', 'max_call_duration'), 15000);
  };
  
  simulateEvents();
}

// Example 6: Error Handling and Retry Logic
export async function robustConversationCreation(retryCount = 0): Promise<any> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  try {
    return await createBasicConversation();
  } catch (error) {
    console.error(`Conversation creation attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return robustConversationCreation(retryCount + 1);
    }
    
    throw new Error(`Failed to create conversation after ${MAX_RETRIES + 1} attempts`);
  }
}

// Example 7: Conversation Analysis and Insights
export interface ConversationInsights {
  qualityScore: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  keyTopics: string[];
  documentOpportunities: string[];
  recommendations: string[];
}

export function analyzeConversation(transcript: any[], analysis: any): ConversationInsights {
  const insights: ConversationInsights = {
    qualityScore: analysis?.conversationQuality?.score || 0,
    sentiment: analysis?.sentiment?.type || 'neutral',
    keyTopics: analysis?.keyTopics || [],
    documentOpportunities: [],
    recommendations: []
  };
  
  // Detect document generation opportunities
  if (insights.keyTopics.includes('funding')) {
    insights.documentOpportunities.push('pitch_deck');
    insights.recommendations.push('Consider generating a pitch deck for your fundraising efforts');
  }
  
  if (insights.keyTopics.includes('strategy') || insights.keyTopics.includes('business_model')) {
    insights.documentOpportunities.push('business_plan');
    insights.recommendations.push('A detailed business plan could help clarify your strategy');
  }
  
  if (insights.keyTopics.includes('market') || insights.keyTopics.includes('competition')) {
    insights.documentOpportunities.push('market_analysis');
    insights.recommendations.push('Market analysis would strengthen your competitive position');
  }
  
  // Quality-based recommendations
  if (insights.qualityScore > 80) {
    insights.recommendations.push('Excellent session! Consider scheduling regular follow-ups');
  } else if (insights.qualityScore < 60) {
    insights.recommendations.push('Consider preparing specific questions for your next session');
  }
  
  // Sentiment-based recommendations
  if (insights.sentiment === 'positive') {
    insights.recommendations.push('Great energy! Keep building on this momentum');
  } else if (insights.sentiment === 'negative') {
    insights.recommendations.push('Consider addressing the challenges discussed in a follow-up session');
  }
  
  return insights;
}

// Example Usage:
/*
// Create a basic conversation
const conversation = await createBasicConversation();

// Create an advanced conversation with custom LLM
const advancedConversation = await createAdvancedConversation();

// Execute LLM tools
const pitchDeck = await executePitchDeckGeneration();

// Set up real-time monitoring
await setupConversationMonitoring('user_123');

// Analyze conversation results
const insights = analyzeConversation(transcript, analysis);
console.log('Conversation insights:', insights);
*/