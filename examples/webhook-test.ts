/**
 * Tavus Webhook Testing Examples
 * 
 * This file demonstrates how to test the Tavus webhook implementation
 * with various event types and scenarios.
 */

// Example webhook payloads for testing
export const SAMPLE_WEBHOOK_PAYLOADS = {
  // System Events
  conversationStarted: {
    event_type: "system.replica_joined",
    message_type: "system",
    conversation_id: "c6174952b",
    properties: {
      replica_id: "r79e1c033f"
    },
    timestamp: "2025-01-15T10:30:00Z"
  },

  conversationEnded: {
    event_type: "system.shutdown",
    message_type: "system", 
    conversation_id: "c6174952b",
    properties: {
      reason: "max_call_duration"
    },
    timestamp: "2025-01-15T11:30:00Z"
  },

  // Application Events
  transcriptionReady: {
    event_type: "application.transcription_ready",
    message_type: "application",
    conversation_id: "c6174952b",
    properties: {
      replica_id: "r79e1c033f",
      transcription: [
        {
          role: "user",
          content: "I need help with my startup pitch deck. We're raising $2M for our FinTech platform.",
          timestamp: "2025-01-15T10:31:00Z"
        },
        {
          role: "assistant",
          content: "I'd be happy to help you create a compelling pitch deck for your FinTech startup. Let me ask you some key questions about your business model and target market.",
          timestamp: "2025-01-15T10:31:15Z"
        },
        {
          role: "user", 
          content: "We're targeting small businesses with our AI-powered payment optimization platform. Our solution reduces transaction fees by 15-20%.",
          timestamp: "2025-01-15T10:32:00Z"
        },
        {
          role: "assistant",
          content: "That's a strong value proposition! Payment optimization is a critical need for small businesses. Let me help you generate a professional pitch deck that highlights this compelling offering.",
          timestamp: "2025-01-15T10:32:30Z"
        }
      ]
    },
    timestamp: "2025-01-15T11:30:00Z"
  },

  // Conversation Events  
  userUtterance: {
    event_type: "conversation.utterance",
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      role: "user",
      text: "Can you help me create a pitch deck for my startup?",
      inference_id: "inf_123"
    },
    timestamp: "2025-01-15T10:31:00Z"
  },

  assistantUtterance: {
    event_type: "conversation.utterance", 
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      role: "assistant",
      text: "I'd be happy to help you create a compelling pitch deck.",
      inference_id: "inf_124"
    },
    timestamp: "2025-01-15T10:31:15Z"
  },

  toolCall: {
    event_type: "conversation.tool_call",
    message_type: "conversation",
    conversation_id: "c6174952b", 
    properties: {
      name: "generate_pitch_deck",
      arguments: JSON.stringify({
        company_name: "PayFlow",
        business_idea: "AI-powered payment optimization for small businesses",
        target_market: "Small to medium businesses",
        funding_amount: "$2M Series A",
        industry: "FinTech",
        stage: "mvp"
      }),
      inference_id: "inf_125"
    },
    timestamp: "2025-01-15T10:32:00Z"
  },

  // Speaking Events
  userStartedSpeaking: {
    event_type: "conversation.user.started_speaking",
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      inference_id: "inf_126"
    },
    timestamp: "2025-01-15T10:33:00Z"
  },

  userStoppedSpeaking: {
    event_type: "conversation.user.stopped_speaking",
    message_type: "conversation",
    conversation_id: "c6174952b", 
    properties: {
      inference_id: "inf_126"
    },
    timestamp: "2025-01-15T10:33:05Z"
  },

  // Perception Events
  perceptionToolCall: {
    event_type: "conversation.perception_tool_call",
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      visual_context: "User is showing a document on screen with financial charts and graphs",
      detected_objects: ["document", "charts", "graphs", "text"],
      inference_id: "inf_127"
    },
    timestamp: "2025-01-15T10:34:00Z"
  },

  perceptionAnalysis: {
    event_type: "conversation.perception_analysis",
    message_type: "conversation", 
    conversation_id: "c6174952b",
    properties: {
      visual_context: "The document appears to be a business plan with financial projections showing strong revenue growth",
      confidence_score: 0.89,
      inference_id: "inf_128"
    },
    timestamp: "2025-01-15T10:34:15Z"
  },

  // Live Interaction Events
  echo: {
    event_type: "conversation.echo",
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      text: "I heard you mention your revenue projections",
      inference_id: "inf_129"
    },
    timestamp: "2025-01-15T10:35:00Z"
  },

  respond: {
    event_type: "conversation.respond",
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      text: "Based on your financial projections, I recommend highlighting your strong unit economics in slide 8 of your pitch deck.",
      inference_id: "inf_130"
    },
    timestamp: "2025-01-15T10:35:30Z"
  },

  interrupt: {
    event_type: "conversation.interrupt", 
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      reason: "clarification_needed",
      inference_id: "inf_131"
    },
    timestamp: "2025-01-15T10:36:00Z"
  },

  overwriteContext: {
    event_type: "conversation.overwrite_context",
    message_type: "conversation",
    conversation_id: "c6174952b",
    properties: {
      new_context: "Focus the conversation on investor relations and fundraising strategy rather than product development.",
      inference_id: "inf_132"
    },
    timestamp: "2025-01-15T10:36:30Z"
  }
};

// Function to test webhook endpoint
export async function testWebhookEndpoint(webhookUrl: string, payload: any) {
  try {
    console.log(`Testing webhook with event: ${payload.event_type}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add signature header if webhook secret is configured
        'x-tavus-signature': 'sha256=test_signature'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.text();
    
    console.log(`Webhook response [${response.status}]:`, result);
    
    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}: ${result}`);
    }
    
    return JSON.parse(result);
  } catch (error) {
    console.error('Webhook test failed:', error);
    throw error;
  }
}

// Function to run all webhook tests
export async function runWebhookTests(webhookUrl: string) {
  console.log('Starting comprehensive webhook tests...');
  
  const tests = [
    { name: 'Conversation Started', payload: SAMPLE_WEBHOOK_PAYLOADS.conversationStarted },
    { name: 'User Utterance', payload: SAMPLE_WEBHOOK_PAYLOADS.userUtterance },
    { name: 'Assistant Utterance', payload: SAMPLE_WEBHOOK_PAYLOADS.assistantUtterance },
    { name: 'Tool Call', payload: SAMPLE_WEBHOOK_PAYLOADS.toolCall },
    { name: 'User Speaking Events', payload: SAMPLE_WEBHOOK_PAYLOADS.userStartedSpeaking },
    { name: 'Perception Tool Call', payload: SAMPLE_WEBHOOK_PAYLOADS.perceptionToolCall },
    { name: 'Perception Analysis', payload: SAMPLE_WEBHOOK_PAYLOADS.perceptionAnalysis },
    { name: 'Live Interaction - Echo', payload: SAMPLE_WEBHOOK_PAYLOADS.echo },
    { name: 'Live Interaction - Respond', payload: SAMPLE_WEBHOOK_PAYLOADS.respond },
    { name: 'Live Interaction - Interrupt', payload: SAMPLE_WEBHOOK_PAYLOADS.interrupt },
    { name: 'Context Overwrite', payload: SAMPLE_WEBHOOK_PAYLOADS.overwriteContext },
    { name: 'Transcription Ready', payload: SAMPLE_WEBHOOK_PAYLOADS.transcriptionReady },
    { name: 'Conversation Ended', payload: SAMPLE_WEBHOOK_PAYLOADS.conversationEnded }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n--- Testing: ${test.name} ---`);
      const result = await testWebhookEndpoint(webhookUrl, test.payload);
      results.push({ name: test.name, success: true, result });
      console.log(`✅ ${test.name} passed`);
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message });
      console.log(`❌ ${test.name} failed:`, error.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n=== Webhook Test Summary ===`);
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.name}: ${r.error}`);
    });
  }
  
  return results;
}

// Function to test webhook signature verification
export async function testWebhookSecurity(webhookUrl: string) {
  console.log('Testing webhook security...');
  
  const testPayload = SAMPLE_WEBHOOK_PAYLOADS.userUtterance;
  
  // Test 1: Request without signature (should fail if security is enabled)
  try {
    console.log('Test 1: Request without signature');
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    console.log('⚠️  Request without signature was accepted (security may be disabled)');
  } catch (error) {
    console.log('✅ Request without signature was rejected');
  }
  
  // Test 2: Request with invalid signature (should fail)
  try {
    console.log('Test 2: Request with invalid signature');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tavus-signature': 'sha256=invalid_signature'
      },
      body: JSON.stringify(testPayload)
    });
    
    if (response.status === 401) {
      console.log('✅ Request with invalid signature was rejected');
    } else {
      console.log('⚠️  Request with invalid signature was accepted');
    }
  } catch (error) {
    console.log('✅ Request with invalid signature was rejected');
  }
  
  // Test 3: Malformed JSON (should fail gracefully)
  try {
    console.log('Test 3: Malformed JSON payload');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json{'
    });
    
    if (response.status === 400) {
      console.log('✅ Malformed JSON was handled gracefully');
    } else {
      console.log('⚠️  Malformed JSON handling could be improved');
    }
  } catch (error) {
    console.log('✅ Malformed JSON was handled gracefully');
  }
}

// Function to test webhook performance under load
export async function testWebhookPerformance(webhookUrl: string, concurrency = 10, totalRequests = 100) {
  console.log(`Testing webhook performance: ${totalRequests} requests with ${concurrency} concurrent connections`);
  
  const startTime = Date.now();
  const results = [];
  
  // Create batches of concurrent requests
  const batchSize = concurrency;
  const batches = Math.ceil(totalRequests / batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = Date.now();
    const requests = [];
    
    const requestsInBatch = Math.min(batchSize, totalRequests - (batch * batchSize));
    
    for (let i = 0; i < requestsInBatch; i++) {
      const payload = {
        ...SAMPLE_WEBHOOK_PAYLOADS.userUtterance,
        conversation_id: `test_${batch}_${i}`,
        timestamp: new Date().toISOString()
      };
      
      requests.push(testWebhookEndpoint(webhookUrl, payload));
    }
    
    try {
      const batchResults = await Promise.allSettled(requests);
      const batchTime = Date.now() - batchStart;
      
      const successful = batchResults.filter(r => r.status === 'fulfilled').length;
      const failed = batchResults.filter(r => r.status === 'rejected').length;
      
      results.push({
        batch: batch + 1,
        successful,
        failed,
        time: batchTime,
        avgResponseTime: batchTime / requestsInBatch
      });
      
      console.log(`Batch ${batch + 1}/${batches}: ${successful} success, ${failed} failed, ${batchTime}ms total`);
      
    } catch (error) {
      console.error(`Batch ${batch + 1} failed:`, error);
    }
  }
  
  const totalTime = Date.now() - startTime;
  const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;
  
  console.log('\n=== Performance Test Results ===');
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Successful: ${totalSuccessful}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success rate: ${((totalSuccessful / totalRequests) * 100).toFixed(2)}%`);
  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Requests per second: ${((totalRequests / totalTime) * 1000).toFixed(2)}`);
  
  return {
    totalTime,
    totalRequests,
    successful: totalSuccessful,
    failed: totalFailed,
    successRate: (totalSuccessful / totalRequests) * 100,
    avgResponseTime,
    requestsPerSecond: (totalRequests / totalTime) * 1000
  };
}

// Example usage:
/*
const WEBHOOK_URL = 'https://your-project.supabase.co/functions/v1/tavus-webhook';

// Run comprehensive tests
await runWebhookTests(WEBHOOK_URL);

// Test security
await testWebhookSecurity(WEBHOOK_URL);

// Test performance
await testWebhookPerformance(WEBHOOK_URL, 5, 50);

// Test individual event
await testWebhookEndpoint(WEBHOOK_URL, SAMPLE_WEBHOOK_PAYLOADS.toolCall);
*/