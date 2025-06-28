import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Subscription validation service for usage tracking and limits enforcement
interface ValidationRequest {
  user_id: string
  action_type: 'conversation' | 'document_generation'
  estimated_duration_minutes?: number
  estimated_tokens?: number
  document_type?: string
}

interface ValidationResponse {
  allowed: boolean
  subscription_status: string
  current_usage: {
    sessions_used: number
    minutes_used: number
    documents_generated: number
    tokens_consumed: number
  }
  limits: {
    max_sessions: number
    max_minutes: number
    max_documents: number
    max_tokens: number
  }
  remaining: {
    sessions: number
    minutes: number
    documents: number
    tokens: number
  }
  warnings?: string[]
  errors?: string[]
  upgrade_required: boolean
  tier_info: {
    current_tier: string
    allows_team_access: boolean
    allows_custom_personas: boolean
    allows_unlimited_tokens: boolean
  }
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

    const validationRequest: ValidationRequest = await req.json()
    
    console.log(`Validating ${validationRequest.action_type} for user ${validationRequest.user_id}`)

    // Get user's current subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('stripe_user_subscriptions')
      .select('*')
      .eq('customer_id', validationRequest.user_id)
      .single()

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({
          allowed: false,
          subscription_status: 'none',
          upgrade_required: true,
          errors: ['No active subscription found'],
          current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
          limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
          remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
          tier_info: {
            current_tier: 'none',
            allows_team_access: false,
            allows_custom_personas: false,
            allows_unlimited_tokens: false
          }
        } as ValidationResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if subscription is active
    if (subscription.subscription_status !== 'active') {
      // If subscription is in trial mode, check if trial has ended
      if (subscription.subscription_status === 'trialing') {
        const trialEndTime = subscription.current_period_end * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        if (currentTime > trialEndTime) {
          return new Response(
            JSON.stringify({
              allowed: false,
              subscription_status: 'trial_ended',
              upgrade_required: true,
              errors: [`Your free trial has ended. Please upgrade to continue using the service.`],
              current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
              limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
              remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
              tier_info: {
                current_tier: 'trial_ended',
                allows_team_access: false,
                allows_custom_personas: false,
                allows_unlimited_tokens: false
              }
            } as ValidationResponse),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({
            allowed: false,
            subscription_status: subscription.subscription_status,
            upgrade_required: true,
            errors: [`Subscription is ${subscription.subscription_status}. Please update your payment method or reactivate your subscription.`],
            current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
            limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
            remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
            tier_info: {
              current_tier: subscription.subscription_status,
              allows_team_access: false,
              allows_custom_personas: false,
              allows_unlimited_tokens: false
            }
          } as ValidationResponse),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({
          allowed: false,
          subscription_status: subscription.subscription_status,
          upgrade_required: true,
          errors: [`Subscription is ${subscription.subscription_status}. Please update your payment method or reactivate your subscription.`],
          current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
          limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
          remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
          tier_info: {
            current_tier: subscription.subscription_status,
            allows_team_access: false,
            allows_custom_personas: false,
            allows_unlimited_tokens: false
          }
        } as ValidationResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get subscription limits for this tier
    const { data: limits, error: limitsError } = await supabaseClient
      .from('subscription_limits')
      .select('*')
      .eq('price_id', subscription.price_id)
      .single()

    if (limitsError || !limits) {
      return new Response(
        JSON.stringify({
          allowed: false,
          subscription_status: subscription.subscription_status,
          upgrade_required: false,
          errors: ['Subscription tier configuration not found'],
          current_usage: { sessions_used: 0, minutes_used: 0, documents_generated: 0, tokens_consumed: 0 },
          limits: { max_sessions: 0, max_minutes: 0, max_documents: 0, max_tokens: 0 },
          remaining: { sessions: 0, minutes: 0, documents: 0, tokens: 0 },
          tier_info: {
            current_tier: 'unknown',
            allows_team_access: false,
            allows_custom_personas: false,
            allows_unlimited_tokens: false
          }
        } as ValidationResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create current usage tracking record
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    const { data: usageTracking, error: usageError } = await supabaseClient
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', validationRequest.user_id)
      .eq('period_start', currentPeriodStart.toISOString())
      .eq('period_end', currentPeriodEnd.toISOString())
      .single()

    let currentUsage
    if (usageError || !usageTracking) {
      // Create new usage tracking record for this billing period
      const { data: newUsage, error: createError } = await supabaseClient
        .from('user_usage_tracking')
        .insert({
          user_id: validationRequest.user_id,
          period_start: currentPeriodStart.toISOString(),
          period_end: currentPeriodEnd.toISOString(),
          subscription_tier: limits.tier_name,
          price_id: subscription.price_id
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }
      currentUsage = newUsage
    } else {
      currentUsage = usageTracking
    }

    return new Response(
      JSON.stringify(await validateAction(validationRequest, currentUsage, limits, supabaseClient)),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Subscription validation error:', error)
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

async function validateAction(
  request: ValidationRequest,
  currentUsage: any,
  limits: any,
  supabaseClient: any
): Promise<ValidationResponse> {
  const warnings: string[] = []
  const errors: string[] = []
  let allowed = true

  // Calculate remaining limits
  const remaining = {
    sessions: Math.max(0, limits.max_sessions_per_period - currentUsage.sessions_used),
    minutes: Math.max(0, limits.max_minutes_per_period - currentUsage.minutes_used),
    documents: limits.max_documents_per_period === -1 ? 999999 : Math.max(0, limits.max_documents_per_period - currentUsage.documents_generated),
    tokens: limits.max_tokens_per_period === -1 ? 999999 : Math.max(0, limits.max_tokens_per_period - currentUsage.tokens_consumed)
  }

  if (request.action_type === 'conversation') {
    // Check session limits
    if (remaining.sessions <= 0) {
      allowed = false
      errors.push(`You have used all ${limits.max_sessions_per_period} video sessions for this billing period.`)
    }

    // Check minute limits
    const estimatedMinutes = request.estimated_duration_minutes || limits.max_minutes_per_session
    if (remaining.minutes < estimatedMinutes) {
      if (remaining.minutes <= 0) {
        allowed = false
        errors.push(`You have used all ${limits.max_minutes_per_period} video minutes for this billing period.`)
      } else {
        warnings.push(`You have ${remaining.minutes} minutes remaining. This session may be limited.`)
      }
    }

    // Warnings for approaching limits
    if (remaining.sessions === 1) {
      warnings.push('This is your last video session for this billing period.')
    }
    if (remaining.minutes <= 30 && remaining.minutes > 0) {
      warnings.push(`You have ${remaining.minutes} minutes remaining in your plan.`)
    }

  } else if (request.action_type === 'document_generation') {
    // Check document limits
    if (limits.max_documents_per_period !== -1 && remaining.documents <= 0) {
      allowed = false
      errors.push(`You have reached your document generation limit of ${limits.max_documents_per_period} for this billing period.`)
    }

    // Check token limits (unless unlimited or BYOK)
    if (!limits.allow_unlimited_tokens && limits.max_tokens_per_period !== -1) {
      const estimatedTokens = request.estimated_tokens || 2000 // Default estimate
      if (remaining.tokens < estimatedTokens) {
        if (remaining.tokens <= 0) {
          allowed = false
          errors.push(`You have used all ${limits.max_tokens_per_period} tokens for this billing period.`)
        } else {
          warnings.push(`You have ${remaining.tokens} tokens remaining. Consider using your own API key for unlimited generation.`)
        }
      }
    }

    // Warnings for approaching limits
    if (limits.max_documents_per_period !== -1 && remaining.documents <= 2) {
      warnings.push(`You have ${remaining.documents} document generations remaining this period.`)
    }
  }

  return {
    allowed,
    subscription_status: 'active', // We already checked this above
    current_usage: {
      sessions_used: currentUsage.sessions_used,
      minutes_used: currentUsage.minutes_used,
      documents_generated: currentUsage.documents_generated,
      tokens_consumed: currentUsage.tokens_consumed
    },
    limits: {
      max_sessions: limits.max_sessions_per_period,
      max_minutes: limits.max_minutes_per_period,
      max_documents: limits.max_documents_per_period === -1 ? 999999 : limits.max_documents_per_period,
      max_tokens: limits.max_tokens_per_period === -1 ? 999999 : limits.max_tokens_per_period
    },
    remaining,
    warnings: warnings.length > 0 ? warnings : undefined,
    errors: errors.length > 0 ? errors : undefined,
    upgrade_required: !allowed,
    tier_info: {
      current_tier: limits.tier_name,
      allows_team_access: limits.allow_team_access,
      allows_custom_personas: limits.allow_custom_personas,
      allows_unlimited_tokens: limits.allow_unlimited_tokens
    }
  }
}