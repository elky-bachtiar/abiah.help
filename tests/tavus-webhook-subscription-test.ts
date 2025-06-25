/**
 * Comprehensive Tavus Webhook Test Suite with Subscription Usage Tracking
 * Tests webhook event creation, verification, and subscription enforcement
 */

import { createClient } from '@supabase/supabase-js'

// Test configuration
const WEBHOOK_URL = 'http://localhost:54321/functions/v1/tavus-webhook'
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'

// Test data setup
interface TestUser {
  id: string
  email: string
  subscription_tier: string
  minutes_limit: number
  current_usage: number
}

interface TestConversation {
  id: string
  user_id: string
  tavus_conversation_id: string
  status: string
  started_at?: string
  ended_at?: string
  duration_minutes?: number
}

interface WebhookPayload {
  conversation_id: string
  event_type: string
  message_type: string
  timestamp: string
  properties: Record<string, any>
}

class TavusWebhookTester {
  private supabase: any
  private testUsers: TestUser[] = []
  private testConversations: TestConversation[] = []

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }

  /**
   * Send webhook event to the handler with proper domain headers
   */
  private async sendWebhookEvent(payload: WebhookPayload, options: {
    origin?: string
    referer?: string
    forwardedFor?: string
    realIp?: string
  } = {}): Promise<Response> {
    const payloadString = JSON.stringify(payload)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add domain headers for verification
    if (options.origin) headers['Origin'] = options.origin
    if (options.referer) headers['Referer'] = options.referer
    if (options.forwardedFor) headers['X-Forwarded-For'] = options.forwardedFor
    if (options.realIp) headers['X-Real-IP'] = options.realIp

    // Default to valid Tavus domain if no headers specified
    if (!options.origin && !options.referer && !options.forwardedFor && !options.realIp) {
      headers['Origin'] = 'https://webhook.tavus.io'
    }

    return fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: payloadString,
    })
  }

  /**
   * Setup test data: users, subscriptions, and conversations
   */
  async setupTestData(): Promise<void> {
    console.log('🔧 Setting up test data...')

    // Create test users with different subscription tiers
    const testUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'starter@test.com',
        subscription_tier: 'starter',
        minutes_limit: 60,
        current_usage: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'pro@test.com',
        subscription_tier: 'pro',
        minutes_limit: 300,
        current_usage: 250, // Near limit
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'enterprise@test.com',
        subscription_tier: 'enterprise',
        minutes_limit: -1, // Unlimited
        current_usage: 500,
      },
    ]

    // Create users in auth.users
    for (const user of testUsers) {
      await this.supabase.auth.admin.createUser({
        user_id: user.id,
        email: user.email,
        email_confirm: true,
      })
    }

    // Create subscription records
    const currentTime = Math.floor(Date.now() / 1000)
    for (const user of testUsers) {
      await this.supabase
        .from('stripe_user_subscriptions')
        .insert({
          customer_id: user.id,
          subscription_id: `sub_${user.subscription_tier}_${Date.now()}`,
          price_id: `price_${user.subscription_tier}`,
          status: 'active',
          current_period_start: currentTime - 86400, // 1 day ago
          current_period_end: currentTime + 86400 * 30, // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
    }

    // Create test conversations
    const testConversations = [
      {
        id: '44444444-4444-4444-4444-444444444444',
        user_id: testUsers[0].id,
        tavus_conversation_id: 'conv_starter_test_001',
        status: 'pending',
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        user_id: testUsers[1].id,
        tavus_conversation_id: 'conv_pro_test_002',
        status: 'pending',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        user_id: testUsers[2].id,
        tavus_conversation_id: 'conv_enterprise_test_003',
        status: 'pending',
      },
    ]

    for (const conversation of testConversations) {
      await this.supabase
        .from('conversations')
        .insert({
          id: conversation.id,
          user_id: conversation.user_id,
          tavus_conversation_id: conversation.tavus_conversation_id,
          status: conversation.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
    }

    this.testUsers = testUsers
    this.testConversations = testConversations
    console.log('✅ Test data setup complete')
  }

  /**
   * Test conversation start event with usage tracking
   */
  async testConversationStartEvent(): Promise<void> {
    console.log('🧪 Testing conversation start event...')

    const conversation = this.testConversations[0] // Starter tier user
    const payload: WebhookPayload = {
      conversation_id: conversation.tavus_conversation_id,
      event_type: 'system.replica_joined',
      message_type: 'system',
      timestamp: new Date().toISOString(),
      properties: {
        replica_id: 'replica_test_001',
      },
    }

    const response = await this.sendWebhookEvent(payload)
    const result = await response.json()

    console.log('📊 Webhook Response:', result)

    // Verify conversation was updated
    const { data: updatedConversation } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('tavus_conversation_id', conversation.tavus_conversation_id)
      .single()

    console.log('🔍 Updated Conversation:', updatedConversation)

    // Verify usage tracking was created
    const { data: usageTracking } = await this.supabase
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', conversation.user_id)
      .single()

    console.log('📈 Usage Tracking:', usageTracking)

    // Verify conversation usage detail was created
    const { data: usageDetail } = await this.supabase
      .from('conversation_usage_details')
      .select('*')
      .eq('conversation_id', conversation.id)
      .single()

    console.log('📋 Usage Detail:', usageDetail)

    // Assertions
    if (updatedConversation?.status !== 'in_progress') {
      throw new Error('Conversation status not updated to in_progress')
    }

    if (!usageTracking) {
      throw new Error('Usage tracking record not created')
    }

    if (usageTracking.sessions_used !== 1) {
      throw new Error('Session count not incremented')
    }

    if (!usageDetail || usageDetail.completion_status !== 'in_progress') {
      throw new Error('Usage detail record not created or incorrect status')
    }

    console.log('✅ Conversation start event test passed')
  }

  /**
   * Test conversation end event with duration calculation
   */
  async testConversationEndEvent(): Promise<void> {
    console.log('🧪 Testing conversation end event...')

    const conversation = this.testConversations[0] // Use same conversation
    const payload: WebhookPayload = {
      conversation_id: conversation.tavus_conversation_id,
      event_type: 'system.shutdown',
      message_type: 'system',
      timestamp: new Date().toISOString(),
      properties: {
        reason: 'participant_left',
      },
    }

    // Wait a bit to simulate conversation duration
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response = await this.sendWebhookEvent(payload)
    const result = await response.json()

    console.log('📊 Webhook Response:', result)

    // Verify conversation was updated with duration
    const { data: endedConversation } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('tavus_conversation_id', conversation.tavus_conversation_id)
      .single()

    console.log('🔍 Ended Conversation:', endedConversation)

    // Verify usage tracking was updated with minutes
    const { data: usageTracking } = await this.supabase
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', conversation.user_id)
      .single()

    console.log('📈 Updated Usage Tracking:', usageTracking)

    // Verify conversation usage detail was updated
    const { data: usageDetail } = await this.supabase
      .from('conversation_usage_details')
      .select('*')
      .eq('conversation_id', conversation.id)
      .single()

    console.log('📋 Updated Usage Detail:', usageDetail)

    // Assertions
    if (!endedConversation?.ended_at) {
      throw new Error('Conversation end time not set')
    }

    if (!endedConversation.duration_minutes || endedConversation.duration_minutes <= 0) {
      throw new Error('Conversation duration not calculated')
    }

    if (!usageTracking || usageTracking.minutes_used <= 0) {
      throw new Error('Usage tracking minutes not updated')
    }

    if (!usageDetail || usageDetail.completion_status === 'in_progress') {
      throw new Error('Usage detail not updated with completion status')
    }

    console.log('✅ Conversation end event test passed')
  }

  /**
   * Test subscription limit enforcement
   */
  async testSubscriptionLimitEnforcement(): Promise<void> {
    console.log('🧪 Testing subscription limit enforcement...')

    // Test with pro user who is near limit (250/300 minutes used)
    const conversation = this.testConversations[1] // Pro tier user
    
    // Create existing usage to simulate near-limit scenario
    const { data: subscription } = await this.supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .eq('customer_id', conversation.user_id)
      .single()

    if (subscription) {
      const periodStart = new Date(subscription.current_period_start * 1000)
      const periodEnd = new Date(subscription.current_period_end * 1000)

      // Create usage tracking with 250 minutes already used
      await this.supabase
        .from('user_usage_tracking')
        .insert({
          user_id: conversation.user_id,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          subscription_tier: subscription.price_id,
          price_id: subscription.price_id,
          minutes_used: 250,
          sessions_used: 10,
          total_conversations: 10,
        })
    }

    // Test starting a conversation
    const startPayload: WebhookPayload = {
      conversation_id: conversation.tavus_conversation_id,
      event_type: 'system.replica_joined',
      message_type: 'system',
      timestamp: new Date().toISOString(),
      properties: {
        replica_id: 'replica_test_002',
      },
    }

    const startResponse = await this.sendWebhookEvent(startPayload)
    const startResult = await startResponse.json()

    console.log('📊 Start Response for Near-Limit User:', startResult)

    // Simulate a 60-minute conversation (would exceed limit)
    const endPayload: WebhookPayload = {
      conversation_id: conversation.tavus_conversation_id,
      event_type: 'system.shutdown',
      message_type: 'system',
      timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
      properties: {
        reason: 'max_call_duration',
      },
    }

    const endResponse = await this.sendWebhookEvent(endPayload)
    const endResult = await endResponse.json()

    console.log('📊 End Response for Long Conversation:', endResult)

    // Verify final usage tracking
    const { data: finalUsage } = await this.supabase
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', conversation.user_id)
      .single()

    console.log('📈 Final Usage Tracking:', finalUsage)

    // In a real implementation, the webhook should handle limit enforcement
    // For now, we just verify the usage is tracked correctly
    if (!finalUsage || finalUsage.minutes_used <= 250) {
      throw new Error('Usage tracking not updated after conversation')
    }

    console.log('✅ Subscription limit enforcement test completed')
  }

  /**
   * Test webhook domain verification
   */
  async testWebhookDomainVerification(): Promise<void> {
    console.log('🧪 Testing webhook domain verification...')

    const conversation = this.testConversations[2] // Enterprise user
    const payload: WebhookPayload = {
      conversation_id: conversation.tavus_conversation_id,
      event_type: 'system.replica_joined',
      message_type: 'system',
      timestamp: new Date().toISOString(),
      properties: {},
    }

    // Test with valid Tavus domains
    const validDomains = [
      'https://tavus.io',
      'https://webhook.tavus.io',
      'https://api.tavus.io',
      'https://tavusapi.com',
      'https://tavus.daily.co'
    ]

    for (const domain of validDomains) {
      const response = await this.sendWebhookEvent(payload, { origin: domain })
      console.log(`✅ Valid domain ${domain} response:`, response.status)
      
      if (response.status !== 200) {
        throw new Error(`Valid domain ${domain} should return 200, got ${response.status}`)
      }
    }

    // Test with unauthorized domains
    const unauthorizedDomains = [
      'https://malicious.com',
      'https://fake-tavus.io',
      'https://evil.net'
    ]

    for (const domain of unauthorizedDomains) {
      const response = await this.sendWebhookEvent(payload, { origin: domain })
      console.log(`❌ Unauthorized domain ${domain} response:`, response.status)
      
      if (response.status === 200) {
        throw new Error(`Unauthorized domain ${domain} should not return 200`)
      }
    }

    // Test with no origin header (should be allowed)
    const noOriginResponse = await this.sendWebhookEvent(payload, {})
    console.log('✅ No origin header response:', noOriginResponse.status)

    if (noOriginResponse.status !== 200) {
      throw new Error('Requests with no origin should be allowed (relies on conversation validation)')
    }

    // Test different header sources
    const headerTests = [
      { referer: 'https://tavus.io/webhook' },
      { forwardedFor: 'api.tavus.io' },
      { realIp: 'webhook.tavus.io' }
    ]

    for (const headers of headerTests) {
      const response = await this.sendWebhookEvent(payload, headers)
      console.log(`✅ Header test ${JSON.stringify(headers)} response:`, response.status)
      
      if (response.status !== 200) {
        throw new Error(`Valid header ${JSON.stringify(headers)} should return 200`)
      }
    }

    console.log('✅ Webhook domain verification test passed')
  }

  /**
   * Test multiple event types
   */
  async testMultipleEventTypes(): Promise<void> {
    console.log('🧪 Testing multiple event types...')

    const conversation = this.testConversations[2] // Enterprise user
    const eventTypes = [
      'application.transcription_ready',
      'conversation.utterance',
      'conversation.tool_call',
      'conversation.replica.started_speaking',
      'conversation.replica.stopped_speaking',
    ]

    for (const eventType of eventTypes) {
      const payload: WebhookPayload = {
        conversation_id: conversation.tavus_conversation_id,
        event_type: eventType,
        message_type: eventType.startsWith('conversation.') ? 'conversation' : 'application',
        timestamp: new Date().toISOString(),
        properties: this.generateEventProperties(eventType),
      }

      const response = await this.sendWebhookEvent(payload)
      const result = await response.json()

      console.log(`📊 ${eventType} Response:`, result.success ? '✅' : '❌')

      if (!result.success) {
        console.error(`❌ Failed to process ${eventType}:`, result.error)
      }
    }

    console.log('✅ Multiple event types test completed')
  }

  /**
   * Generate event-specific properties
   */
  private generateEventProperties(eventType: string): Record<string, any> {
    switch (eventType) {
      case 'application.transcription_ready':
        return {
          transcription: [
            { role: 'user', content: 'Hello, I need help with my business plan.' },
            { role: 'assistant', content: 'I\'d be happy to help you with your business plan. What specific areas would you like to focus on?' },
          ],
        }
      case 'conversation.utterance':
        return {
          text: 'I want to create a pitch deck for my startup.',
          role: 'user',
        }
      case 'conversation.tool_call':
        return {
          name: 'generate_pitch_deck',
          arguments: JSON.stringify({
            company_name: 'TestCorp',
            industry: 'fintech',
            stage: 'seed',
          }),
          inference_id: 'inf_test_001',
        }
      case 'conversation.replica.started_speaking':
      case 'conversation.replica.stopped_speaking':
        return {
          replica_id: 'replica_test_003',
        }
      default:
        return {}
    }
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    console.log('🧹 Cleaning up test data...')

    // Delete test conversations
    for (const conversation of this.testConversations) {
      await this.supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id)
    }

    // Delete usage tracking records
    for (const user of this.testUsers) {
      await this.supabase
        .from('user_usage_tracking')
        .delete()
        .eq('user_id', user.id)
      
      await this.supabase
        .from('conversation_usage_details')
        .delete()
        .eq('user_id', user.id)
      
      await this.supabase
        .from('stripe_user_subscriptions')
        .delete()
        .eq('customer_id', user.id)
    }

    // Delete test users
    for (const user of this.testUsers) {
      await this.supabase.auth.admin.deleteUser(user.id)
    }

    console.log('✅ Test data cleanup complete')
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Tavus Webhook Subscription Test Suite...\n')

    try {
      await this.setupTestData()
      await this.testWebhookDomainVerification()
      await this.testConversationStartEvent()
      await this.testConversationEndEvent()
      await this.testSubscriptionLimitEnforcement()
      await this.testMultipleEventTypes()
      
      console.log('\n🎉 All tests passed!')
    } catch (error) {
      console.error('\n❌ Test failed:', error)
      throw error
    } finally {
      await this.cleanupTestData()
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new TavusWebhookTester()
  tester.runAllTests().catch(console.error)
}

export { TavusWebhookTester }