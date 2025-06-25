import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Enhanced webhook payload interface to handle all Tavus event types
interface TavusWebhookPayload {
  properties: {
    replica_id?: string
    transcription?: Array<{
      role: 'user' | 'assistant'
      content: string
      timestamp?: string
    }>
    // System event properties
    reason?: string // for shutdown events
    // Live interaction properties
    text?: string // for utterance, echo, respond events
    role?: 'user' | 'assistant' // for speaking events
    inference_id?: string // for utterance and tool calls
    // Tool call properties
    name?: string // function name
    arguments?: string // function arguments JSON
    // Perception properties
    visual_context?: string
    detected_objects?: string[]
    confidence_score?: number
    // Live interaction properties
    action?: string // for sensitivity events
    new_context?: string // for context overwrite events
    // Recording properties
    recording_url?: string
    duration?: number
    file_size?: number
    format?: string
    // Perception analysis properties
    analysis_summary?: string
    visual_context_summary?: string
    detected_objects_summary?: string[]
    overall_confidence?: number
  }
  conversation_id: string
  event_type: string
  message_type: 'system' | 'application' | 'conversation'
  timestamp: string
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

/**
 * Verify webhook request origin by checking if it comes from Tavus domains
 * @param req Request object
 * @returns boolean indicating if request origin is valid
 */
function verifyTavusDomain(req: Request): boolean {
  // Known Tavus domains and IP ranges
  const allowedOrigins = [
    'tavus.io',
    'tavusapi.com',
    'webhook.tavus.io',
    'api.tavus.io',
    'tavus.daily.co'
  ]
  
  // Get origin from various headers
  const origin = req.headers.get('origin') || 
                 req.headers.get('referer') || 
                 req.headers.get('x-forwarded-for') ||
                 req.headers.get('x-real-ip')
  
  if (!origin) {
    // For webhooks, origin might not be set, so we allow it
    // and rely on conversation validation instead
    console.log('[DEBUG] No origin header found, allowing request')
    return true
  }
  
  // Check if origin contains any allowed domain
  const isAllowed = allowedOrigins.some(domain => 
    origin.toLowerCase().includes(domain.toLowerCase())
  )
  
  if (!isAllowed) {
    console.error('[ERROR] Request from unauthorized domain:', origin)
    return false
  }
  
  console.log('[DEBUG] Request from authorized domain:', origin)
  return true
}

/**
 * Verify webhook request by validating conversation ID exists in our database
 * Since Tavus doesn't provide webhook signatures, we validate that the conversation_id
 * belongs to a real conversation created through our system
 * @param supabaseClient Supabase client instance
 * @param payload Webhook payload
 * @returns boolean indicating if request is valid
 */
async function verifyWebhookRequest(supabaseClient: any, payload: TavusWebhookPayload): Promise<boolean> {
  try {
    // Verify the conversation exists in our database
    const { data: conversation, error } = await supabaseClient
      .from('conversations')
      .select('id, user_id, tavus_conversation_id, status')
      .eq('tavus_conversation_id', payload.conversation_id)
      .single()
    
    if (error || !conversation) {
      console.error('[ERROR] Webhook validation failed: conversation not found', payload.conversation_id)
      return false
    }
    
    // Additional validation: ensure conversation is in a valid state
    const validStatuses = ['pending', 'in_progress', 'completed', 'ended', 'ended_early']
    if (!validStatuses.includes(conversation.status)) {
      console.error('[ERROR] Webhook validation failed: invalid conversation status', conversation.status)
      return false
    }
    
    console.log('[DEBUG] Webhook validation passed for conversation:', conversation.id)
    return true
  } catch (error) {
    console.error('[ERROR] Webhook validation error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // First, verify the request comes from a Tavus domain
    const isDomainValid = verifyTavusDomain(req)
    if (!isDomainValid) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized domain' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get raw body for validation
    const rawBody = await req.text()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse JSON payload
    let payload: TavusWebhookPayload
    try {
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('[ERROR] Failed to parse webhook payload:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify webhook request by validating conversation exists in our database
    const isRequestValid = await verifyWebhookRequest(supabaseClient, payload)
    if (!isRequestValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook request: conversation not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Webhook received: ${payload.event_type} for conversation ${payload.conversation_id}`)

    // Log the webhook event
    await supabaseClient
      .from('conversation_events')
      .insert({
        conversation_id: payload.conversation_id,
        event_type: payload.event_type,
        event_data: payload,
        processed: false,
        created_at: new Date().toISOString()
      })

    // Route events to appropriate processors with retry logic
    const processingResult = await processWebhookWithRetry(
      supabaseClient, 
      payload
    )
    
    // Mark event as processed
    await supabaseClient
      .from('conversation_events')
      .update({ 
        processed: true,
        processing_attempts: processingResult.attempts || 1,
        last_processing_error: processingResult.lastError || null
      })
      .eq('conversation_id', payload.conversation_id)
      .eq('event_type', payload.event_type)
      .eq('created_at', new Date().toISOString())
    
    return new Response(
      JSON.stringify(processingResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Process webhook with retry logic for failed operations
 * @param supabaseClient Supabase client instance
 * @param payload Webhook payload
 * @param retryCount Current retry attempt
 * @returns Processing result with retry information
 */
async function processWebhookWithRetry(
  supabaseClient: any,
  payload: TavusWebhookPayload,
  retryCount = 0
): Promise<any> {
  const MAX_RETRIES = 3
  const RETRY_DELAY_MS = 1000 // Base delay in milliseconds
  const BACKOFF_MULTIPLIER = 2 // Exponential backoff
  
  try {
    const result = await routeEventProcessing(supabaseClient, payload)
    return {
      ...result,
      attempts: retryCount + 1,
      success: true
    }
  } catch (error) {
    console.error(`[ERROR] Webhook processing attempt ${retryCount + 1} failed:`, error)
    
    if (retryCount < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, retryCount)
      console.log(`[DEBUG] Retrying in ${delayMs}ms (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`)
      
      await new Promise(resolve => setTimeout(resolve, delayMs))
      return processWebhookWithRetry(supabaseClient, payload, retryCount + 1)
    }
    
    // All retries exhausted, log failure
    console.error(`[ERROR] All ${MAX_RETRIES + 1} webhook processing attempts failed for event ${payload.event_type}`)
    
    // Log failure to database for manual review
    try {
      await supabaseClient
        .from('webhook_processing_failures')
        .insert({
          conversation_id: payload.conversation_id,
          event_type: payload.event_type,
          payload,
          error_message: error.message,
          retry_attempts: retryCount + 1,
          failed_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('[ERROR] Failed to log webhook processing failure:', logError)
    }
    
    return {
      success: false,
      error: error.message,
      attempts: retryCount + 1,
      lastError: error.message
    }
  }
}

/**
 * Route webhook events to appropriate processors based on event type
 * @param supabaseClient Supabase client instance
 * @param payload Webhook payload
 * @returns Processing result
 */
async function routeEventProcessing(
  supabaseClient: any,
  payload: TavusWebhookPayload
) {
  const { event_type, message_type } = payload
  
  console.log(`Processing ${message_type}.${event_type} for conversation ${payload.conversation_id}`)
  
  try {
    switch (message_type) {
      case 'system':
        return await processSystemEvent(supabaseClient, payload)
      
      case 'application':
        return await processApplicationEvent(supabaseClient, payload)
      
      case 'conversation':
        return await processConversationEvent(supabaseClient, payload)
      
      default:
        console.warn(`Unknown message type: ${message_type}`)
        return {
          success: true,
          message: `Event logged but not processed: ${message_type}.${event_type}`,
          event_type
        }
    }
  } catch (error) {
    console.error(`Error processing ${message_type}.${event_type}:`, error)
    throw error
  }
}

/**
 * Process system events (replica_joined, shutdown)
 * @param supabaseClient Supabase client instance
 * @param payload Webhook payload
 */
async function processSystemEvent(
  supabaseClient: any,
  payload: TavusWebhookPayload
) {
  const { event_type, conversation_id, properties } = payload
  
  // Find conversation
  const conversation = await findConversation(supabaseClient, conversation_id)
  if (!conversation) {
    return { success: false, error: 'Conversation not found' }
  }
  
  switch (event_type) {
    case 'system.replica_joined':
      // Get or create usage tracking record
      const usageTracking = await getOrCreateUsageTracking(supabaseClient, conversation.user_id)
      
      const startedAt = new Date().toISOString()
      
      // Update conversation status to active
      await supabaseClient
        .from('conversations')
        .update({
          status: 'in_progress',
          started_at: startedAt,
          updated_at: startedAt,
          usage_tracking_id: usageTracking?.id || null
        })
        .eq('id', conversation.id)
      
      // Create conversation usage detail record
      if (usageTracking) {
        await createConversationUsageDetail(
          supabaseClient,
          conversation,
          usageTracking.id,
          startedAt
        )
        
        // Increment session count in usage tracking
        await updateUsageTracking(supabaseClient, usageTracking.id, {
          sessions_increment: 1
        })
      }
      
      // Broadcast real-time update
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'conversation_started',
        conversationId: conversation.id,
        status: 'in_progress'
      })
      
      return { success: true, message: 'Conversation started', event_type }
    
    case 'system.shutdown':
      // Update conversation based on shutdown reason
      const status = properties?.reason === 'max_call_duration' 
        ? 'completed' 
        : properties?.reason === 'participant_left_timeout'
        ? 'ended_early'
        : 'ended'
      
      const endedAt = new Date().toISOString()
      
      // Get conversation start time to calculate duration
      const { data: conversationDetails } = await supabaseClient
        .from('conversations')
        .select('started_at, usage_tracking_id')
        .eq('id', conversation.id)
        .single()
      
      let actualDurationMinutes = 0
      if (conversationDetails?.started_at) {
        const startTime = new Date(conversationDetails.started_at)
        const endTime = new Date(endedAt)
        actualDurationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      }
      
      // Update conversation with duration
      await supabaseClient
        .from('conversations')
        .update({
          status,
          ended_at: endedAt,
          updated_at: endedAt,
          duration_minutes: actualDurationMinutes,
          actual_duration_seconds: actualDurationMinutes * 60
        })
        .eq('id', conversation.id)
      
      // Update usage tracking and conversation usage details
      if (conversationDetails?.usage_tracking_id && actualDurationMinutes > 0) {
        // Update usage tracking with minutes used
        await updateUsageTracking(supabaseClient, conversationDetails.usage_tracking_id, {
          minutes_increment: actualDurationMinutes
        })
        
        // Update conversation usage detail
        const completionStatus = status === 'completed' ? 'completed' : 
                               status === 'ended_early' ? 'terminated_by_user' : 'terminated_by_limit'
        
        await updateConversationUsageDetail(
          supabaseClient,
          conversation.id,
          endedAt,
          actualDurationMinutes,
          completionStatus,
          properties?.reason
        )
      }
      
      // Broadcast real-time update
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'conversation_ended',
        conversationId: conversation.id,
        status,
        reason: properties?.reason
      })
      
      return { success: true, message: 'Conversation ended', event_type, reason: properties?.reason }
    
    default:
      return { success: true, message: `System event logged: ${event_type}`, event_type }
  }
}

/**
 * Process application events (transcription_ready)
 * @param supabaseClient Supabase client instance
 * @param payload Webhook payload
 */
async function processApplicationEvent(
  supabaseClient: any,
  payload: TavusWebhookPayload
) {
  const { event_type, conversation_id, properties } = payload
  
  // Find conversation
  const conversation = await findConversation(supabaseClient, conversation_id)
  if (!conversation) {
    return { success: false, error: 'Conversation not found' }
  }
  
  switch (event_type) {
    case 'application.transcription_ready':
      return await processTranscriptionReady(supabaseClient, conversation, properties)
    
    case 'application.recording_ready':
      return await processRecordingReady(supabaseClient, conversation, properties)
    
    case 'application.perception_analysis':
      return await processPerceptionAnalysis(supabaseClient, conversation, properties)
    
    default:
      return { success: true, message: `Application event logged: ${event_type}`, event_type }
  }
}

/**
 * Process transcription ready event
 */
async function processTranscriptionReady(
  supabaseClient: any,
  conversation: any,
  properties: any
) {
  const conversation_id = conversation.tavus_conversation_id || conversation.id
  
  // Check if transcript already exists
  const { data: existingTranscript } = await supabaseClient
    .from('conversation_transcripts')
    .select('id')
    .eq('conversation_id', conversation_id)
    .single()
  
  if (existingTranscript) {
    return {
      success: true,
      message: 'Transcript already processed',
      transcriptId: existingTranscript.id
    }
  }
  
  if (!properties?.transcription) {
    return { success: false, error: 'No transcription data provided' }
  }
  
  // Process and analyze transcript
  const transcriptAnalysis = await analyzeTranscript(properties.transcription)
  
  // Calculate conversation statistics
  const userMessages = properties.transcription.filter(msg => msg.role === 'user')
  const assistantMessages = properties.transcription.filter(msg => msg.role === 'assistant')
  
  // Save transcript with analysis
  const { data: transcript, error: transcriptError } = await supabaseClient
    .from('conversation_transcripts')
    .insert({
      consultation_id: conversation.id,
      conversation_id,
      transcript: properties.transcription,
      metadata: {
        replica_id: properties.replica_id,
        total_messages: properties.transcription.length,
        user_message_count: userMessages.length,
        assistant_message_count: assistantMessages.length,
        webhook_received_at: new Date().toISOString(),
        conversation_duration_estimate: properties.transcription.length * 3,
        ...transcriptAnalysis
      }
    })
    .select()
    .single()
  
  if (transcriptError) {
    throw new Error(`Failed to save transcript: ${transcriptError.message}`)
  }
  
  // Update conversation with analysis results
  await supabaseClient
    .from('conversations')
    .update({
      status: 'completed',
      has_transcript: true,
      key_topics: transcriptAnalysis.keyTopics,
      insights_count: transcriptAnalysis.insights?.length || 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversation.id)
  
  // Process post-conversation actions
  await processPostConversationActions(
    supabaseClient,
    conversation.id,
    transcript.id,
    properties.transcription,
    transcriptAnalysis
  )
  
  return {
    success: true,
    message: 'Transcript processed and analyzed',
    transcriptId: transcript.id,
    conversationId: conversation.id,
    analysis: transcriptAnalysis
  }
}

/**
 * Process recording ready event
 */
async function processRecordingReady(
  supabaseClient: any,
  conversation: any,
  properties: any
) {
  const conversation_id = conversation.tavus_conversation_id || conversation.id
  
  // Update conversation with recording information
  await supabaseClient
    .from('conversations')
    .update({
      has_recording: true,
      recording_url: properties?.recording_url,
      recording_duration: properties?.duration,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversation.id)
  
  // Log recording ready event
  await supabaseClient
    .from('conversation_events')
    .insert({
      conversation_id: conversation_id,
      event_type: 'application.recording_ready',
      event_data: {
        recording_url: properties?.recording_url,
        duration: properties?.duration,
        file_size: properties?.file_size,
        format: properties?.format
      },
      processed: true,
      created_at: new Date().toISOString()
    })
  
  // Broadcast recording ready notification
  await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
    type: 'recording_ready',
    conversationId: conversation.id,
    recordingUrl: properties?.recording_url,
    duration: properties?.duration
  })
  
  return {
    success: true,
    message: 'Recording processed and saved',
    conversationId: conversation.id,
    recordingUrl: properties?.recording_url
  }
}

/**
 * Process perception analysis event
 */
async function processPerceptionAnalysis(
  supabaseClient: any,
  conversation: any,
  properties: any
) {
  const conversation_id = conversation.tavus_conversation_id || conversation.id
  
  // Save perception analysis results
  await supabaseClient
    .from('conversation_perception_events')
    .insert({
      conversation_id: conversation.id,
      event_type: 'application.perception_analysis',
      analysis_result: properties?.analysis_summary,
      visual_context: properties?.visual_context_summary,
      detected_objects: properties?.detected_objects_summary,
      confidence_score: properties?.overall_confidence,
      timestamp: new Date().toISOString()
    })
  
  // Update conversation with perception analysis metadata
  await supabaseClient
    .from('conversations')
    .update({
      metadata: {
        perception_analysis: {
          objects_detected: properties?.detected_objects_summary?.length || 0,
          overall_confidence: properties?.overall_confidence,
          analysis_summary: properties?.analysis_summary,
          analyzed_at: new Date().toISOString()
        }
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', conversation.id)
  
  // Broadcast perception analysis results
  await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
    type: 'perception_analysis_complete',
    conversationId: conversation.id,
    analysis: properties?.analysis_summary,
    confidence: properties?.overall_confidence,
    objectsDetected: properties?.detected_objects_summary?.length || 0
  })
  
  return {
    success: true,
    message: 'Perception analysis processed',
    conversationId: conversation.id,
    analysis: properties?.analysis_summary
  }
}

/**
 * Process conversation events (utterance, tool_call, speaking events)
 * @param supabaseClient Supabase client instance
 * @param payload Webhook payload
 */
async function processConversationEvent(
  supabaseClient: any,
  payload: TavusWebhookPayload
) {
  const { event_type, conversation_id, properties } = payload
  
  // Find conversation
  const conversation = await findConversation(supabaseClient, conversation_id)
  if (!conversation) {
    return { success: false, error: 'Conversation not found' }
  }
  
  switch (event_type) {
    case 'conversation.utterance':
      // Log utterance for real-time processing
      await supabaseClient
        .from('conversation_utterances')
        .insert({
          conversation_id: conversation.id,
          role: properties?.role,
          content: properties?.text,
          inference_id: properties?.inference_id,
          timestamp: new Date().toISOString()
        })
      
      // Broadcast real-time utterance
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'utterance',
        conversationId: conversation.id,
        role: properties?.role,
        content: properties?.text
      })
      
      return { success: true, message: 'Utterance logged', event_type }
    
    case 'conversation.tool_call':
      // Log tool call
      await supabaseClient
        .from('conversation_tool_calls')
        .insert({
          conversation_id: conversation.id,
          function_name: properties?.name,
          function_arguments: properties?.arguments,
          inference_id: properties?.inference_id,
          timestamp: new Date().toISOString()
        })
      
      // Broadcast tool call event
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'tool_call',
        conversationId: conversation.id,
        functionName: properties?.name,
        arguments: properties?.arguments
      })
      
      return { success: true, message: 'Tool call logged', event_type }
    
    case 'conversation.replica.started_speaking':
    case 'conversation.replica.stopped_speaking':
    case 'conversation.user.started_speaking':
    case 'conversation.user.stopped_speaking':
      // Broadcast speaking state changes
      const isReplica = event_type.includes('replica')
      const isStarted = event_type.includes('started')
      
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'speaking_state_change',
        conversationId: conversation.id,
        speaker: isReplica ? 'replica' : 'user',
        state: isStarted ? 'started' : 'stopped',
        inferenceId: properties?.inference_id
      })
      
      return { success: true, message: `Speaking state change: ${event_type}`, event_type }
    
    case 'conversation.perception_tool_call':
      // Handle visual context analysis tool calls
      await supabaseClient
        .from('conversation_perception_events')
        .insert({
          conversation_id: conversation.id,
          event_type: 'perception_tool_call',
          visual_context: properties?.visual_context,
          detected_objects: properties?.detected_objects,
          inference_id: properties?.inference_id,
          timestamp: new Date().toISOString()
        })
      
      // Broadcast perception event
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'perception_tool_call',
        conversationId: conversation.id,
        visualContext: properties?.visual_context,
        detectedObjects: properties?.detected_objects
      })
      
      return { success: true, message: 'Perception tool call logged', event_type }
    
    case 'conversation.perception_analysis':
      // Handle perception analysis results
      await supabaseClient
        .from('conversation_perception_events')
        .insert({
          conversation_id: conversation.id,
          event_type: 'perception_analysis',
          analysis_result: properties?.visual_context,
          confidence_score: properties?.confidence_score,
          inference_id: properties?.inference_id,
          timestamp: new Date().toISOString()
        })
      
      // Broadcast analysis results
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'perception_analysis',
        conversationId: conversation.id,
        analysis: properties?.visual_context,
        confidence: properties?.confidence_score
      })
      
      return { success: true, message: 'Perception analysis logged', event_type }
    
    case 'conversation.echo':
    case 'conversation.respond':
    case 'conversation.sensitivity':
    case 'conversation.interrupt':
    case 'conversation.replica_interrupted':
    case 'conversation.overwrite_context':
      // Handle live interaction events
      await supabaseClient
        .from('conversation_interaction_events')
        .insert({
          conversation_id: conversation.id,
          event_type,
          interaction_data: {
            text: properties?.text,
            reason: properties?.reason,
            action: properties?.action,
            new_context: properties?.new_context
          },
          inference_id: properties?.inference_id,
          timestamp: new Date().toISOString()
        })
      
      // Broadcast interaction event
      await broadcastConversationUpdate(supabaseClient, conversation.user_id, {
        type: 'live_interaction',
        conversationId: conversation.id,
        interactionType: event_type,
        data: properties
      })
      
      return { success: true, message: `Live interaction event logged: ${event_type}`, event_type }
    
    default:
      return { success: true, message: `Conversation event logged: ${event_type}`, event_type }
  }
}

/**
 * Find conversation by Tavus conversation ID
 * @param supabaseClient Supabase client instance
 * @param conversationId Tavus conversation ID
 * @returns Conversation record or null
 */
async function findConversation(supabaseClient: any, conversationId: string) {
  const { data, error } = await supabaseClient
    .from('conversations')
    .select('id, user_id, usage_tracking_id, subscription_tier_at_creation')
    .eq('tavus_conversation_id', conversationId)
    .single()
  
  if (error) {
    console.error('Error finding conversation:', error)
    return null
  }
  
  return data
}

/**
 * Get or create usage tracking record for current billing period
 * @param supabaseClient Supabase client instance
 * @param userId User ID
 * @returns Usage tracking record
 */
async function getOrCreateUsageTracking(supabaseClient: any, userId: string) {
  // First, get user's current subscription to determine billing period
  const { data: subscription } = await supabaseClient
    .from('stripe_user_subscriptions')
    .select('*')
    .eq('customer_id', userId)
    .single()

  if (!subscription) {
    console.error('No subscription found for user:', userId)
    return null
  }

  const periodStart = new Date(subscription.current_period_start * 1000)
  const periodEnd = new Date(subscription.current_period_end * 1000)

  // Try to get existing usage tracking record
  const { data: existingUsage } = await supabaseClient
    .from('user_usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString())
    .eq('period_end', periodEnd.toISOString())
    .single()

  if (existingUsage) {
    return existingUsage
  }

  // Create new usage tracking record
  const { data: newUsage, error } = await supabaseClient
    .from('user_usage_tracking')
    .insert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      subscription_tier: subscription.price_id,
      price_id: subscription.price_id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating usage tracking record:', error)
    return null
  }

  return newUsage
}

/**
 * Update usage tracking with conversation metrics
 * @param supabaseClient Supabase client instance
 * @param usageTrackingId Usage tracking record ID
 * @param updates Updates to apply
 */
async function updateUsageTracking(
  supabaseClient: any,
  usageTrackingId: string,
  updates: {
    sessions_increment?: number
    minutes_increment?: number
    documents_increment?: number
    tokens_increment?: number
  }
) {
  // Build SQL increment expressions
  const updateFields: any = {}
  
  if (updates.sessions_increment) {
    updateFields.sessions_used = supabaseClient.sql`sessions_used + ${updates.sessions_increment}`
    updateFields.total_conversations = supabaseClient.sql`total_conversations + ${updates.sessions_increment}`
  }
  
  if (updates.minutes_increment) {
    updateFields.minutes_used = supabaseClient.sql`minutes_used + ${updates.minutes_increment}`
  }
  
  if (updates.documents_increment) {
    updateFields.documents_generated = supabaseClient.sql`documents_generated + ${updates.documents_increment}`
  }
  
  if (updates.tokens_increment) {
    updateFields.tokens_consumed = supabaseClient.sql`tokens_consumed + ${updates.tokens_increment}`
  }

  // Update timestamps
  updateFields.updated_at = new Date().toISOString()
  
  if (updates.sessions_increment || updates.minutes_increment) {
    updateFields.last_conversation_at = new Date().toISOString()
  }
  
  if (updates.documents_increment || updates.tokens_increment) {
    updateFields.last_document_generated_at = new Date().toISOString()
  }

  const { error } = await supabaseClient
    .from('user_usage_tracking')
    .update(updateFields)
    .eq('id', usageTrackingId)

  if (error) {
    console.error('Error updating usage tracking:', error)
    throw error
  }
}

/**
 * Create conversation usage detail record
 * @param supabaseClient Supabase client instance
 * @param conversation Conversation record
 * @param usageTrackingId Usage tracking record ID
 * @param startedAt Conversation start time
 */
async function createConversationUsageDetail(
  supabaseClient: any,
  conversation: any,
  usageTrackingId: string,
  startedAt: string
) {
  const { error } = await supabaseClient
    .from('conversation_usage_details')
    .insert({
      conversation_id: conversation.id,
      user_id: conversation.user_id,
      usage_tracking_id: usageTrackingId,
      started_at: startedAt,
      planned_duration_minutes: 30, // Default, could be customized per tier
      completion_status: 'in_progress'
    })

  if (error) {
    console.error('Error creating conversation usage detail:', error)
    throw error
  }
}

/**
 * Update conversation usage detail with completion info
 * @param supabaseClient Supabase client instance
 * @param conversationId Conversation ID
 * @param endedAt End time
 * @param actualDurationMinutes Actual duration in minutes
 * @param completionStatus Completion status
 * @param terminationReason Reason for termination
 */
async function updateConversationUsageDetail(
  supabaseClient: any,
  conversationId: string,
  endedAt: string,
  actualDurationMinutes: number,
  completionStatus: string,
  terminationReason?: string
) {
  const actualDurationSeconds = actualDurationMinutes * 60

  const { error } = await supabaseClient
    .from('conversation_usage_details')
    .update({
      ended_at: endedAt,
      actual_duration_minutes: actualDurationMinutes,
      duration_seconds: actualDurationSeconds,
      completion_status: completionStatus,
      termination_reason: terminationReason,
      updated_at: new Date().toISOString()
    })
    .eq('conversation_id', conversationId)

  if (error) {
    console.error('Error updating conversation usage detail:', error)
    throw error
  }
}

/**
 * Broadcast real-time updates to connected clients
 * @param supabaseClient Supabase client instance
 * @param userId User ID
 * @param payload Update payload
 */
async function broadcastConversationUpdate(
  supabaseClient: any,
  userId: string,
  payload: any
) {
  try {
    const channel = supabaseClient.channel(`user-${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'conversation_update',
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error broadcasting update:', error)
  }
}

/**
 * Analyze conversation transcript for insights and topics
 * @param transcript Array of conversation messages
 * @returns Analysis results
 */
async function analyzeTranscript(transcript: any[]) {
  const userMessages = transcript.filter(msg => msg.role === 'user')
  const assistantMessages = transcript.filter(msg => msg.role === 'assistant')
  
  // Extract key topics using simple keyword analysis
  // In production, this could use more sophisticated NLP
  const allText = transcript.map(msg => msg.content).join(' ').toLowerCase()
  
  const topicKeywords = {
    'funding': ['funding', 'investment', 'investor', 'raise', 'capital', 'money', 'financial'],
    'product': ['product', 'feature', 'development', 'build', 'mvp', 'prototype'],
    'market': ['market', 'customer', 'user', 'target', 'audience', 'segment'],
    'strategy': ['strategy', 'plan', 'approach', 'roadmap', 'vision', 'goal'],
    'team': ['team', 'hiring', 'staff', 'employee', 'founder', 'cofounder'],
    'technology': ['technology', 'tech', 'platform', 'software', 'system', 'code'],
    'business_model': ['business model', 'revenue', 'monetization', 'pricing', 'subscription'],
    'growth': ['growth', 'scale', 'expand', 'acquisition', 'retention', 'metrics']
  }
  
  const detectedTopics = []
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      detectedTopics.push(topic)
    }
  }
  
  // Generate simple insights
  const insights = []
  
  if (userMessages.length > assistantMessages.length) {
    insights.push({
      type: 'engagement',
      message: 'High user engagement - founder was very active in the conversation',
      confidence: 0.8
    })
  }
  
  if (detectedTopics.includes('funding')) {
    insights.push({
      type: 'opportunity',
      message: 'Funding topics discussed - consider generating pitch deck materials',
      confidence: 0.9
    })
  }
  
  if (detectedTopics.includes('product') && detectedTopics.includes('market')) {
    insights.push({
      type: 'strategy',
      message: 'Product-market fit discussion detected - valuable strategic conversation',
      confidence: 0.85
    })
  }
  
  return {
    keyTopics: detectedTopics,
    insights,
    messageStats: {
      totalMessages: transcript.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      avgMessageLength: transcript.reduce((sum, msg) => sum + msg.content.length, 0) / transcript.length
    },
    sentiment: analyzeSentiment(userMessages),
    conversationQuality: calculateConversationQuality(transcript)
  }
}

/**
 * Analyze sentiment of user messages
 * @param userMessages Array of user messages
 * @returns Sentiment analysis
 */
function analyzeSentiment(userMessages: any[]) {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['great', 'good', 'excellent', 'amazing', 'perfect', 'love', 'excited', 'confident']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worried', 'concerned', 'frustrated', 'difficult']
  
  let positiveCount = 0
  let negativeCount = 0
  
  const allUserText = userMessages.map(msg => msg.content).join(' ').toLowerCase()
  
  positiveWords.forEach(word => {
    if (allUserText.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (allUserText.includes(word)) negativeCount++
  })
  
  const total = positiveCount + negativeCount
  if (total === 0) return { type: 'neutral', confidence: 0.5 }
  
  const positiveRatio = positiveCount / total
  
  if (positiveRatio > 0.6) {
    return { type: 'positive', confidence: positiveRatio }
  } else if (positiveRatio < 0.4) {
    return { type: 'negative', confidence: 1 - positiveRatio }
  } else {
    return { type: 'mixed', confidence: 0.6 }
  }
}

/**
 * Calculate conversation quality metrics
 * @param transcript Array of conversation messages
 * @returns Quality metrics
 */
function calculateConversationQuality(transcript: any[]) {
  const messageCount = transcript.length
  const avgMessageLength = transcript.reduce((sum, msg) => sum + msg.content.length, 0) / messageCount
  
  // Quality scoring based on engagement and depth
  let qualityScore = 0
  
  // Message count factor (more messages = better engagement)
  if (messageCount > 20) qualityScore += 30
  else if (messageCount > 10) qualityScore += 20
  else if (messageCount > 5) qualityScore += 10
  
  // Message length factor (longer messages = more depth)
  if (avgMessageLength > 100) qualityScore += 30
  else if (avgMessageLength > 50) qualityScore += 20
  else if (avgMessageLength > 25) qualityScore += 10
  
  // Conversation balance factor
  const userMessages = transcript.filter(msg => msg.role === 'user').length
  const assistantMessages = transcript.filter(msg => msg.role === 'assistant').length
  const balance = Math.min(userMessages, assistantMessages) / Math.max(userMessages, assistantMessages)
  qualityScore += balance * 40
  
  return {
    score: Math.min(100, qualityScore),
    engagement: messageCount > 10 ? 'high' : messageCount > 5 ? 'medium' : 'low',
    depth: avgMessageLength > 75 ? 'high' : avgMessageLength > 40 ? 'medium' : 'low',
    balance: balance > 0.7 ? 'excellent' : balance > 0.5 ? 'good' : 'poor'
  }
}

// Enhanced post-conversation processing
async function processPostConversationActions(
  supabaseClient: any,
  consultationId: string,
  transcriptId: string,
  transcript: any[],
  analysis?: any
) {
  try {
    // Use analysis results if available, otherwise perform basic analysis
    let keyTopics = []
    let documentOpportunities = {}
    
    if (analysis) {
      keyTopics = analysis.keyTopics || []
      documentOpportunities = {
        pitch_deck: keyTopics.includes('funding'),
        business_plan: keyTopics.includes('strategy') || keyTopics.includes('business_model'),
        market_analysis: keyTopics.includes('market') || keyTopics.includes('growth')
      }
    } else {
      // Fallback to original keyword analysis
      const userInputs = transcript
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ')
      
      documentOpportunities = {
        pitch_deck: /pitch deck|investor presentation|funding presentation/i.test(userInputs),
        business_plan: /business plan|strategic plan|planning/i.test(userInputs),
        market_analysis: /market analysis|market research|competition/i.test(userInputs)
      }
    }

    // Log potential document generation opportunities
    if (Object.values(documentOpportunities).some(Boolean)) {
      await supabaseClient
        .from('document_generation_opportunities')
        .insert({
          consultation_id: consultationId,
          suggested_documents: documentOpportunities,
          conversation_context: transcript
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content)
            .join(' ')
            .substring(0, 1000),
          analysis_metadata: analysis ? {
            topics: analysis.keyTopics,
            insights: analysis.insights,
            quality_score: analysis.conversationQuality?.score
          } : null,
          created_at: new Date().toISOString()
        })
    }

    // Generate automatic consultation summary
    await supabaseClient
      .from('document_generation_requests')
      .insert({
        consultation_id: consultationId,
        conversation_transcript_id: transcriptId,
        requested_document_type: 'consultation_summary',
        status: 'pending',
        parameters: {
          auto_generated: true,
          transcript_length: transcript.length,
          trigger: 'conversation_completion'
        }
      })

    // Broadcast real-time update to frontend
    await supabaseClient
      .from('conversations')
      .select('user_id')
      .eq('id', consultationId)
      .single()
      .then(({ data }) => {
        if (data?.user_id) {
          // Create a channel specifically for this user
          const channel = supabaseClient.channel(`user-${data.user_id}`)
          
          // Broadcast the event
          channel.send({
            type: 'broadcast',
            event: 'conversation_completed',
            payload: { 
              consultationId, 
              transcriptId,
              messageCount: transcript.length,
              completedAt: new Date().toISOString(),
              documentOpportunities,
              analysis: analysis ? {
                keyTopics: analysis.keyTopics,
                insights: analysis.insights,
                quality: analysis.conversationQuality
              } : null
            }
          })
        }
      })

  } catch (error) {
    console.error('Post-conversation processing error:', error)
  }
}