# Tavus Conversational Video Interface (CVI) Implementation Guide

This comprehensive guide covers how to implement Tavus CVI with webhook handling, LLM tools, and custom AI integration based on the current implementation in this codebase.

## Table of Contents

- [Overview](#overview)
- [API Authentication](#api-authentication)
- [Conversation Creation](#conversation-creation)
- [Webhook Implementation](#webhook-implementation)
- [LLM Tools Integration](#llm-tools-integration)
- [Custom LLM Setup](#custom-llm-setup)
- [Live Interaction Protocols](#live-interaction-protocols)
- [Frontend Integration](#frontend-integration)
- [Security Considerations](#security-considerations)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

Tavus Conversational Video Interface (CVI) enables real-time AI-powered video conversations with advanced features like:

- **Real-time conversation management** with system events
- **Webhook-based event handling** for transcription and analysis
- **LLM tool integration** for document generation during conversations
- **Custom LLM routing** for persona-specific AI responses
- **Live interaction protocols** for dynamic conversation control

### Architecture

```
Frontend (React) 
    ↓
Supabase Edge Functions (Proxy + Webhook Handler)
    ↓
Tavus API + Custom LLM Endpoints
    ↓
Database (Conversations, Transcripts, Generated Documents)
```

## API Authentication

### Environment Variables Required

```bash
# Tavus API
TAVUS_API_KEY=your_tavus_api_key

# Supabase (for database and edge functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM APIs (for custom LLM integration)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Frontend Environment

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ENABLE_LLM_TOOLS=true  # Enable LLM tools
```

## Conversation Creation

### Basic Conversation Creation

```typescript
// Frontend: src/api/createConversation.ts
import { callTavusAPI } from './tavus';

const payload = {
  replica_id: "r79e1c033f",  // Optional: specific replica
  persona_id: "pebc953c8b73",  // Required: persona ID
  callback_url: `${SUPABASE_URL}/functions/v1/tavus-webhook`,
  conversation_name: "AI Mentorship Session",
  conversational_context: "You are an expert startup mentor...",
  custom_greeting: "Hello! I'm excited to help you with your startup journey.",
  properties: {
    max_call_duration: 3600,  // seconds
    participant_left_timeout: 60,
    participant_absent_timeout: 300,
    enable_recording: true,
    enable_closed_captions: true,
    apply_greenscreen: false,
    language: "english",
    // LLM Tools Configuration
    enable_llm_tools: true
  }
};

const conversation = await callTavusAPI({
  method: 'POST',
  endpoint: '/v2/conversations',
  data: payload
});
```

### Advanced Conversation with Custom LLM

```typescript
// Custom LLM configuration
const customHeaders = {
  'x-custom-llm-config': JSON.stringify({
    use_custom_llm: true,
    persona_type: 'fintech',  // or 'general', 'healthtech', 'b2b-saas', 'enterprise'
    model: 'gpt-4-turbo',     // or 'claude-3-sonnet'
    endpoint_url: `${SUPABASE_URL}/functions/v1/custom-llm`
  })
};

const conversation = await callTavusAPI({
  method: 'POST',
  endpoint: '/v2/conversations',
  data: payload,
  headers: customHeaders
});
```

### Conversation Response

```json
{
  "conversation_id": "c6174952b",
  "status": "active",
  "conversation_url": "https://tavusapi.com/...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

## Webhook Implementation

### Webhook Endpoint Setup

The webhook handler is implemented in `supabase/functions/tavus-webhook/index.ts` and handles all Tavus event types:

```typescript
// Webhook URL Configuration
const webhookUrl = `${SUPABASE_URL}/functions/v1/tavus-webhook`;

// Register webhook in conversation creation
const payload = {
  // ... other properties
  callback_url: webhookUrl
};
```

### Supported Event Types

#### 1. System Events

```typescript
// system.replica_joined - Conversation started
{
  "event_type": "system.replica_joined",
  "message_type": "system",
  "conversation_id": "c6174952b",
  "properties": {
    "replica_id": "r79e1c033f"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}

// system.shutdown - Conversation ended
{
  "event_type": "system.shutdown", 
  "message_type": "system",
  "conversation_id": "c6174952b",
  "properties": {
    "reason": "max_call_duration" // or "participant_left_timeout"
  },
  "timestamp": "2025-01-15T11:30:00Z"
}
```

#### 2. Application Events

```typescript
// application.transcription_ready - Full transcript available
{
  "event_type": "application.transcription_ready",
  "message_type": "application", 
  "conversation_id": "c6174952b",
  "properties": {
    "replica_id": "r79e1c033f",
    "transcription": [
      {
        "role": "user",
        "content": "I need help with my startup pitch",
        "timestamp": "2025-01-15T10:31:00Z"
      },
      {
        "role": "assistant", 
        "content": "I'd be happy to help you refine your pitch...",
        "timestamp": "2025-01-15T10:31:15Z"
      }
    ]
  },
  "timestamp": "2025-01-15T11:30:00Z"
}
```

#### 3. Conversation Events

```typescript
// conversation.utterance - Real-time message
{
  "event_type": "conversation.utterance",
  "message_type": "conversation",
  "conversation_id": "c6174952b", 
  "properties": {
    "role": "user",
    "text": "Can you help me create a pitch deck?",
    "inference_id": "inf_123"
  },
  "timestamp": "2025-01-15T10:31:00Z"
}

// conversation.tool_call - LLM tool execution
{
  "event_type": "conversation.tool_call",
  "message_type": "conversation",
  "conversation_id": "c6174952b",
  "properties": {
    "name": "generate_pitch_deck",
    "arguments": "{\"company_name\":\"MyStartup\",\"business_idea\":\"...\"}",
    "inference_id": "inf_124"
  },
  "timestamp": "2025-01-15T10:32:00Z"
}

// Speaking state events
{
  "event_type": "conversation.user.started_speaking",
  "message_type": "conversation", 
  "conversation_id": "c6174952b",
  "properties": {
    "inference_id": "inf_125"
  },
  "timestamp": "2025-01-15T10:33:00Z"
}
```

### Webhook Processing Flow

```typescript
// 1. Event Reception and Logging
await supabaseClient
  .from('conversation_events')
  .insert({
    conversation_id: payload.conversation_id,
    event_type: payload.event_type,
    event_data: payload,
    processed: false
  });

// 2. Event Routing
switch (payload.message_type) {
  case 'system':
    await processSystemEvent(supabaseClient, payload);
    break;
  case 'application': 
    await processApplicationEvent(supabaseClient, payload);
    break;
  case 'conversation':
    await processConversationEvent(supabaseClient, payload);
    break;
}

// 3. Real-time Broadcasting
await supabaseClient
  .channel(`user-${userId}`)
  .send({
    type: 'broadcast',
    event: 'conversation_update',
    payload: { /* update data */ }
  });
```

### Advanced Conversation Analysis

When transcription is ready, the webhook performs comprehensive analysis:

```typescript
// Automatic conversation analysis
const analysis = {
  keyTopics: ['funding', 'product', 'market'],
  insights: [
    {
      type: 'opportunity',
      message: 'Funding topics discussed - consider generating pitch deck',
      confidence: 0.9
    }
  ],
  sentiment: {
    type: 'positive',
    confidence: 0.85
  },
  conversationQuality: {
    score: 87,
    engagement: 'high',
    depth: 'high', 
    balance: 'excellent'
  }
};

// Save analysis with transcript
await supabaseClient
  .from('conversation_transcripts')
  .insert({
    consultation_id: conversation.id,
    conversation_id,
    transcript: properties.transcription,
    metadata: {
      ...analysis,
      total_messages: properties.transcription.length,
      user_message_count: userMessages.length,
      assistant_message_count: assistantMessages.length
    }
  });
```

## LLM Tools Integration

### Tool Definitions

LLM tools are defined in `supabase/functions/tavus-api-llm/index.ts`:

```typescript
const LLM_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_pitch_deck",
      description: "Generate a comprehensive startup pitch deck for investors",
      parameters: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Company or startup name" },
          business_idea: { type: "string", description: "Core business concept" },
          target_market: { type: "string", description: "Target market description" },
          funding_amount: { type: "string", description: "Funding amount sought" },
          industry: { type: "string", description: "Industry category" },
          stage: { type: "string", enum: ["idea", "prototype", "mvp", "growth"] }
        },
        required: ["company_name", "business_idea", "target_market", "funding_amount", "industry"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_business_plan",
      description: "Create a detailed business plan document", 
      parameters: {
        type: "object",
        properties: {
          business_name: { type: "string" },
          business_model: { type: "string" },
          target_customers: { type: "string" },
          competitive_advantage: { type: "string" },
          plan_type: { type: "string", enum: ["executive_summary", "standard", "comprehensive"] }
        },
        required: ["business_name", "business_model", "target_customers"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_market_research",
      description: "Provide market analysis and competitive intelligence",
      parameters: {
        type: "object",
        properties: {
          industry: { type: "string" },
          geographic_focus: { type: "string" },
          research_depth: { type: "string", enum: ["overview", "detailed", "comprehensive"] }
        },
        required: ["industry"]
      }
    }
  }
];
```

### Tool Execution Flow

```typescript
// 1. Tool Call Reception via Webhook
{
  "event_type": "conversation.tool_call",
  "properties": {
    "name": "generate_pitch_deck",
    "arguments": "{\"company_name\":\"MyStartup\",\"business_idea\":\"AI-powered analytics\"}"
  }
}

// 2. Tool Execution
const result = await executeLLMTool(req, {
  toolName: 'generate_pitch_deck',
  parameters: JSON.parse(arguments),
  consultationId: conversation.id,
  conversationId: payload.conversation_id
});

// 3. Document Generation
const document = await generatePitchDeckWithOpenAI(parameters);

// 4. Database Storage
await supabaseClient
  .from('generated_documents')
  .insert({
    consultation_id: consultationId,
    document_type: 'pitch_deck',
    title: `${parameters.company_name} Pitch Deck`,
    content: document,
    metadata: {
      generation_parameters: parameters,
      model: 'gpt-4'
    }
  });
```

### Document Generation Results

```typescript
// Pitch Deck Structure
{
  "slides": [
    {
      "id": "slide-1",
      "title": "Problem Statement", 
      "type": "problem",
      "content": "Current market pain points..."
    },
    {
      "id": "slide-2",
      "title": "Solution Overview",
      "type": "solution", 
      "content": "Our innovative approach..."
    }
    // ... more slides
  ],
  "metadata": {
    "company_name": "MyStartup",
    "industry": "Technology",
    "slide_count": 12
  }
}
```

## Custom LLM Setup

### Persona-Specific System Prompts

```typescript
// supabase/functions/custom-llm/index.ts
function getPersonaSystemPrompt(persona: string): string {
  const personaPrompts = {
    'fintech': `You specialize in FinTech startups. You understand regulatory compliance, 
                financial services, payment systems, and the unique challenges of building 
                trust in financial products.`,
    
    'healthtech': `You specialize in HealthTech startups. You understand HIPAA compliance, 
                  healthcare regulations, clinical workflows, and healthcare innovation challenges.`,
    
    'b2b-saas': `You specialize in B2B SaaS startups. You understand enterprise sales, 
                customer success, product-market fit for business customers, and scaling challenges.`,
    
    'enterprise': `You specialize in enterprise-focused startups. You understand complex sales cycles, 
                  stakeholder management, compliance requirements, and enterprise customer needs.`
  };
  
  return personaPrompts[persona] || personaPrompts.general;
}
```

### Custom LLM Integration

```typescript
// Enhanced conversation creation with custom LLM
const enhancedPayload = {
  ...originalPayload,
  custom_llm_url: `${SUPABASE_URL}/functions/v1/custom-llm?persona=fintech&user_id=${userId}&model=gpt-4`
};

// Custom LLM endpoint handles chat completions
const response = await callOpenAI({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: personaSystemPrompt + '\n\n' + conversationContext
    },
    ...conversationMessages
  ],
  temperature: 0.7,
  max_tokens: 500
});
```

## Live Interaction Protocols

### Conversation Control Events

Based on Tavus documentation, you can send these events during live conversations:

```typescript
// Echo user input back
{
  "type": "conversation.echo",
  "text": "I heard you say: [user input]"
}

// Override AI response
{
  "type": "conversation.respond", 
  "text": "Let me provide a different perspective..."
}

// Handle sensitive content
{
  "type": "conversation.sensitivity",
  "action": "block",
  "reason": "inappropriate_content"
}

// Interrupt conversation
{
  "type": "conversation.interrupt",
  "reason": "clarification_needed"
}

// Update conversation context
{
  "type": "conversation.overwrite_context",
  "new_context": "Updated context based on user feedback..."
}
```

### Perception Tool Integration

For visual context analysis (not yet implemented):

```typescript
// conversation.perception_tool_call
{
  "event_type": "conversation.perception_tool_call",
  "properties": {
    "visual_context": "User is showing a document on screen",
    "detected_objects": ["document", "text", "charts"]
  }
}

// conversation.perception_analysis 
{
  "event_type": "conversation.perception_analysis",
  "properties": {
    "analysis": "The document appears to be a business plan with financial projections"
  }
}
```

## Frontend Integration

### Real-time Conversation Updates

```typescript
// src/components/conversation/ConversationHistory.tsx
useEffect(() => {
  const conversationChannel = supabase
    .channel(`user-${user.id}`)
    .on('broadcast', { event: 'conversation_update' }, (payload) => {
      const { type, conversationId, status } = payload.payload;
      
      if (type === 'conversation_started') {
        // Update UI to show active conversation
        updateConversationStatus(conversationId, 'in_progress');
      } else if (type === 'conversation_completed') {
        // Reload conversation list with new transcript
        loadConversations();
      } else if (type === 'tool_call') {
        // Show tool execution notification
        showToolCallNotification(payload.functionName);
      }
    })
    .subscribe();

  return () => conversationChannel.unsubscribe();
}, [user?.id]);
```

### Conversation Analysis Display

```typescript
// src/components/conversation/ConversationTranscript.tsx
interface ConversationAnalysis {
  keyTopics: string[];
  insights: Array<{
    type: 'opportunity' | 'engagement' | 'strategy';
    message: string;
    confidence: number;
  }>;
  sentiment: {
    type: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
  };
  conversationQuality: {
    score: number;
    engagement: 'high' | 'medium' | 'low';
    depth: 'high' | 'medium' | 'low';
    balance: 'excellent' | 'good' | 'poor';
  };
}

// Display quality metrics
<div className="quality-metrics">
  <div className="score-bar">
    <div 
      className="score-fill"
      style={{ width: `${analysis.conversationQuality.score}%` }}
    />
  </div>
  <div className="metrics-grid">
    <div>Engagement: {analysis.conversationQuality.engagement}</div>
    <div>Depth: {analysis.conversationQuality.depth}</div>
    <div>Balance: {analysis.conversationQuality.balance}</div>
  </div>
</div>
```

### Document Generation UI

```typescript
// Document generation from conversation
const handleGenerateDocument = async (documentType: string) => {
  const result = await callTavusAPI({
    method: 'POST',
    endpoint: '/tools/execute',
    data: {
      toolName: documentType,
      parameters: extractParametersFromConversation(conversation),
      consultationId: conversation.id
    }
  });
  
  if (result.success) {
    // Navigate to generated document
    router.push(`/documents/${result.documentId}`);
  }
};
```

## Security Considerations

### Webhook Signature Verification

```typescript
// TODO: Implement webhook signature verification
function verifyWebhookSignature(req: Request, payload: string): boolean {
  const signature = req.headers.get('x-tavus-signature');
  const webhookSecret = Deno.env.get('TAVUS_WEBHOOK_SECRET');
  
  if (!signature || !webhookSecret) {
    return false;
  }
  
  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
    
  return signature === `sha256=${expectedSignature}`;
}
```

### API Key Security

```typescript
// Never expose API keys in frontend
// ❌ Wrong - in frontend code
const TAVUS_API_KEY = 'your-api-key';

// ✅ Correct - in Supabase Edge Function
const TAVUS_API_KEY = Deno.env.get('TAVUS_API_KEY');

// ✅ Correct - proxy through secure endpoint
const conversation = await callTavusAPI({
  method: 'POST',
  endpoint: '/v2/conversations',
  data: payload  // API key added by edge function
});
```

### Database Security

```sql
-- Row Level Security (RLS) policies
CREATE POLICY "Users can only see their own conversations" 
  ON conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Webhook service can update conversations"
  ON conversations
  FOR UPDATE
  USING (auth.role() = 'service_role');
```

## Error Handling

### Webhook Error Handling

```typescript
// Retry mechanism for failed webhooks
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

async function processWebhookWithRetry(payload: TavusWebhookPayload, retryCount = 0): Promise<any> {
  try {
    return await routeEventProcessing(supabaseClient, payload);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
      return processWebhookWithRetry(payload, retryCount + 1);
    }
    
    // Log failed webhook for manual review
    await supabaseClient
      .from('webhook_failures')
      .insert({
        conversation_id: payload.conversation_id,
        event_type: payload.event_type,
        payload,
        error_message: error.message,
        retry_count: retryCount
      });
    
    throw error;
  }
}
```

### Frontend Error Handling

```typescript
// API error handling with user feedback
try {
  const conversation = await createConversation(userId, title);
  toast.success('Conversation created successfully!');
} catch (error) {
  if (error.message.includes('API key')) {
    toast.error('Configuration error. Please contact support.');
  } else if (error.message.includes('rate limit')) {
    toast.error('Too many requests. Please try again in a moment.');
  } else {
    toast.error('Failed to create conversation. Please try again.');
  }
  console.error('Conversation creation error:', error);
}
```

## Examples

### Complete Conversation Flow

```typescript
// 1. Create conversation
const conversation = await createConversation(userId, "Startup Strategy Session");

// 2. Handle real-time events
const channel = supabase
  .channel(`conversation-${conversation.conversation_id}`)
  .on('broadcast', { event: 'conversation_update' }, handleConversationUpdate)
  .subscribe();

// 3. Process webhook events automatically
// (handled by supabase/functions/tavus-webhook/index.ts)

// 4. Display conversation results
const conversationDetails = await getConversationDetails(conversation.id);
// Shows transcript, analysis, generated documents
```

### Custom LLM Integration Example

```typescript
// 1. Configure custom LLM
const customConfig = {
  use_custom_llm: true,
  persona_type: 'fintech',
  model: 'gpt-4-turbo',
  endpoint_url: `${SUPABASE_URL}/functions/v1/custom-llm`
};

// 2. Create enhanced conversation
const conversation = await callTavusAPI({
  method: 'POST',
  endpoint: '/v2/conversations',
  data: payload,
  headers: {
    'x-custom-llm-config': JSON.stringify(customConfig)
  }
});

// 3. AI responses will be persona-specific and contextual
```

### Tool Integration Example

```typescript
// 1. User mentions needing a pitch deck in conversation
// 2. AI detects intent and calls generate_pitch_deck tool
// 3. Webhook receives tool_call event
// 4. Edge function executes tool with OpenAI/Claude
// 5. Generated document saved to database
// 6. Frontend receives real-time notification
// 7. User can access generated pitch deck

// Manual tool execution
const result = await executeLLMTool(req, {
  toolName: 'generate_pitch_deck',
  parameters: {
    company_name: 'MyStartup',
    business_idea: 'AI-powered analytics platform',
    target_market: 'Small to medium businesses',
    funding_amount: '$500K',
    industry: 'Technology'
  },
  consultationId: conversation.id
});
```

## Database Schema

### Core Tables

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tavus_conversation_id TEXT UNIQUE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  mentor_persona TEXT DEFAULT 'general',
  key_topics TEXT[],
  insights_count INTEGER DEFAULT 0,
  quality_score INTEGER,
  has_transcript BOOLEAN DEFAULT false,
  has_recording BOOLEAN DEFAULT false,
  context_data JSONB DEFAULT '{}',
  message_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Events (Webhook Log)
CREATE TABLE conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Transcripts
CREATE TABLE conversation_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES conversations(id),
  conversation_id TEXT NOT NULL,
  transcript JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Documents
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES conversations(id),
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM Tool Executions
CREATE TABLE llm_tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES conversations(id),
  tool_name TEXT NOT NULL,
  input_parameters JSONB NOT NULL,
  execution_result JSONB,
  success BOOLEAN DEFAULT false,
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

This implementation provides a comprehensive foundation for Tavus CVI integration with advanced webhook handling, LLM tools, and real-time conversation management.