import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TavusWebhookPayload {
  properties: {
    replica_id: string
    transcription: Array<{
      role: 'user' | 'assistant'
      content: string
    }>
  }
  conversation_id: string
  event_type: string
  message_type: string
  timestamp: string
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: TavusWebhookPayload = await req.json()
    
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

    // Only process transcription ready events
    if (payload.event_type !== 'application.transcription_ready') {
      return new Response(
        JSON.stringify({ 
          message: 'Event logged but not processed', 
          event_type: payload.event_type 
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find the consultation by conversation_id
    const { data: consultation, error: consultationError } = await supabaseClient
      .from('conversations')
      .select('id, user_id')
      .eq('tavus_conversation_id', payload.conversation_id)
      .single()

    if (consultationError || !consultation) {
      console.error('Error finding consultation:', consultationError || 'No consultation found')
      return new Response(
        JSON.stringify({ 
          error: 'Consultation not found', 
          conversation_id: payload.conversation_id 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if transcript already exists (prevent duplicates)
    const { data: existingTranscript } = await supabaseClient
      .from('conversation_transcripts')
      .select('id')
      .eq('conversation_id', payload.conversation_id)
      .single()

    if (existingTranscript) {
      console.log(`Transcript already exists for conversation ${payload.conversation_id}`)
      return new Response(
        JSON.stringify({ 
          message: 'Transcript already processed', 
          conversation_id: payload.conversation_id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate conversation statistics
    const userMessages = payload.properties.transcription.filter(msg => msg.role === 'user')
    const assistantMessages = payload.properties.transcription.filter(msg => msg.role === 'assistant')

    // Save conversation transcript
    const { data: transcript, error: transcriptError } = await supabaseClient
      .from('conversation_transcripts')
      .insert({
        consultation_id: consultation.id,
        conversation_id: payload.conversation_id,
        transcript: payload.properties.transcription,
        metadata: {
          replica_id: payload.properties.replica_id,
          total_messages: payload.properties.transcription.length,
          user_message_count: userMessages.length,
          assistant_message_count: assistantMessages.length,
          webhook_received_at: new Date().toISOString(),
          conversation_duration_estimate: payload.properties.transcription.length * 3 // rough estimate
        }
      })
      .select()
      .single()

    if (transcriptError) {
      console.error('Error saving transcript:', transcriptError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save transcript', 
          details: transcriptError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update conversation status to completed
    const { error: conversationUpdateError } = await supabaseClient
      .from('conversations')
      .update({ 
        status: 'completed',
        has_transcript: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', consultation.id)

    if (conversationUpdateError) {
      console.error('Error updating conversation:', conversationUpdateError)
    }

    // Mark the webhook event as processed
    await supabaseClient
      .from('conversation_events')
      .update({ processed: true })
      .eq('conversation_id', payload.conversation_id)
      .eq('event_type', payload.event_type)

    // Process post-conversation actions
    await processPostConversationActions(
      supabaseClient, 
      consultation.id, 
      transcript.id,
      payload.properties.transcription
    )

    console.log(`Successfully processed conversation ${payload.conversation_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcriptId: transcript.id,
        consultationId: consultation.id,
        messageCount: payload.properties.transcription.length
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
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

// Post-conversation processing
async function processPostConversationActions(
  supabaseClient: any,
  consultationId: string,
  transcriptId: string,
  transcript: any[]
) {
  try {
    // Analyze conversation for automatic document generation opportunities
    const userInputs = transcript
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')

    // Check if user mentioned specific document needs
    const mentionsPitchDeck = /pitch deck|investor presentation|funding presentation/i.test(userInputs)
    const mentionsBusinessPlan = /business plan|strategic plan|planning/i.test(userInputs)
    const mentionsMarketAnalysis = /market analysis|market research|competition/i.test(userInputs)

    // Log potential document generation opportunities
    if (mentionsPitchDeck || mentionsBusinessPlan || mentionsMarketAnalysis) {
      await supabaseClient
        .from('document_generation_opportunities')
        .insert({
          consultation_id: consultationId,
          suggested_documents: {
            pitch_deck: mentionsPitchDeck,
            business_plan: mentionsBusinessPlan,
            market_analysis: mentionsMarketAnalysis
          },
          conversation_context: userInputs.substring(0, 1000), // First 1000 chars
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
              documentOpportunities: {
                pitch_deck: mentionsPitchDeck,
                business_plan: mentionsBusinessPlan,
                market_analysis: mentionsMarketAnalysis
              }
            }
          })
        }
      })

  } catch (error) {
    console.error('Post-conversation processing error:', error)
  }
}