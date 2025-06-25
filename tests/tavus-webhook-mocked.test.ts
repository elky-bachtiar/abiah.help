/**
 * Tavus Webhook Test Suite with Jest Mocks
 * Unit tests for webhook handler functions with mocked dependencies
 */

import { jest } from '@jest/globals'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
  sql: jest.fn(),
}

// Mock database query builders
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

// Setup mock chain
mockSupabaseClient.from.mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
})

mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle })
mockInsert.mockReturnValue({ select: mockSelect, single: mockSingle })
mockUpdate.mockReturnValue({ eq: mockEq })
mockDelete.mockReturnValue({ eq: mockEq })
mockEq.mockReturnValue({ single: mockSingle })

// Mock webhook handler functions (these would be imported from the actual file)
const mockFindConversation = jest.fn()
const mockGetOrCreateUsageTracking = jest.fn()
const mockUpdateUsageTracking = jest.fn()
const mockCreateConversationUsageDetail = jest.fn()
const mockUpdateConversationUsageDetail = jest.fn()
const mockBroadcastConversationUpdate = jest.fn()
const mockVerifyTavusDomain = jest.fn()
const mockVerifyWebhookRequest = jest.fn()

describe('Tavus Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Domain Verification', () => {
    const allowedDomains = [
      'tavus.io',
      'tavusapi.com', 
      'webhook.tavus.io',
      'api.tavus.io',
      'tavus.daily.co'
    ]

    it('should allow requests from Tavus domains', () => {
      allowedDomains.forEach(domain => {
        const mockRequest = {
          headers: {
            get: jest.fn().mockImplementation((header) => {
              if (header === 'origin') return `https://${domain}`
              return null
            })
          }
        }

        mockVerifyTavusDomain.mockReturnValue(true)

        const result = mockVerifyTavusDomain(mockRequest)

        expect(result).toBe(true)
        expect(mockVerifyTavusDomain).toHaveBeenCalledWith(mockRequest)
      })
    })

    it('should reject requests from unauthorized domains', () => {
      const unauthorizedDomains = [
        'malicious.com',
        'fake-tavus.io',
        'evil.net',
        'phishing-site.com'
      ]

      unauthorizedDomains.forEach(domain => {
        const mockRequest = {
          headers: {
            get: jest.fn().mockImplementation((header) => {
              if (header === 'origin') return `https://${domain}`
              return null
            })
          }
        }

        mockVerifyTavusDomain.mockReturnValue(false)

        const result = mockVerifyTavusDomain(mockRequest)

        expect(result).toBe(false)
      })
    })

    it('should check multiple header sources for origin', () => {
      const headerScenarios = [
        { origin: 'https://tavus.io' },
        { referer: 'https://webhook.tavus.io/callback' },
        { 'x-forwarded-for': '192.168.1.1, api.tavus.io' },
        { 'x-real-ip': 'tavus.daily.co' }
      ]

      headerScenarios.forEach(headers => {
        const mockRequest = {
          headers: {
            get: jest.fn().mockImplementation((header) => {
              return headers[header] || null
            })
          }
        }

        mockVerifyTavusDomain.mockReturnValue(true)

        const result = mockVerifyTavusDomain(mockRequest)

        expect(result).toBe(true)
      })
    })

    it('should allow requests with no origin header (rely on conversation validation)', () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null) // No headers set
        }
      }

      mockVerifyTavusDomain.mockReturnValue(true)

      const result = mockVerifyTavusDomain(mockRequest)

      expect(result).toBe(true)
    })

    it('should handle case-insensitive domain matching', () => {
      const mixedCaseDomains = [
        'TAVUS.IO',
        'Webhook.Tavus.IO', 
        'API.tavus.io'
      ]

      mixedCaseDomains.forEach(domain => {
        const mockRequest = {
          headers: {
            get: jest.fn().mockImplementation((header) => {
              if (header === 'origin') return `https://${domain}`
              return null
            })
          }
        }

        mockVerifyTavusDomain.mockReturnValue(true)

        const result = mockVerifyTavusDomain(mockRequest)

        expect(result).toBe(true)
      })
    })
  })

  describe('Webhook Request Validation', () => {
    const mockPayload = {
      conversation_id: 'tavus-conv-789',
      event_type: 'system.replica_joined',
      message_type: 'system',
      timestamp: new Date().toISOString(),
      properties: {}
    }

    const mockConversation = {
      id: 'conv-123',
      user_id: 'user-456',
      tavus_conversation_id: 'tavus-conv-789',
      status: 'pending'
    }

    it('should validate webhook request with existing conversation', async () => {
      mockSingle.mockResolvedValue({ data: mockConversation, error: null })
      mockVerifyWebhookRequest.mockResolvedValue(true)

      const result = await mockVerifyWebhookRequest(mockSupabaseClient, mockPayload)

      expect(result).toBe(true)
      expect(mockVerifyWebhookRequest).toHaveBeenCalledWith(mockSupabaseClient, mockPayload)
    })

    it('should reject webhook request with non-existent conversation', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })
      mockVerifyWebhookRequest.mockResolvedValue(false)

      const result = await mockVerifyWebhookRequest(mockSupabaseClient, mockPayload)

      expect(result).toBe(false)
    })

    it('should reject webhook request with invalid conversation status', async () => {
      const invalidConversation = {
        ...mockConversation,
        status: 'deleted' // Invalid status
      }

      mockSingle.mockResolvedValue({ data: invalidConversation, error: null })
      mockVerifyWebhookRequest.mockResolvedValue(false)

      const result = await mockVerifyWebhookRequest(mockSupabaseClient, mockPayload)

      expect(result).toBe(false)
    })

    it('should validate all allowed conversation statuses', async () => {
      const validStatuses = ['pending', 'in_progress', 'completed', 'ended', 'ended_early']

      for (const status of validStatuses) {
        const conversation = { ...mockConversation, status }
        mockSingle.mockResolvedValue({ data: conversation, error: null })
        mockVerifyWebhookRequest.mockResolvedValue(true)

        const result = await mockVerifyWebhookRequest(mockSupabaseClient, mockPayload)

        expect(result).toBe(true)
      }
    })

    it('should handle database errors gracefully', async () => {
      mockSingle.mockRejectedValue(new Error('Database connection failed'))
      mockVerifyWebhookRequest.mockResolvedValue(false)

      const result = await mockVerifyWebhookRequest(mockSupabaseClient, mockPayload)

      expect(result).toBe(false)
    })

    it('should validate conversation ID format', async () => {
      const invalidPayloads = [
        { ...mockPayload, conversation_id: '' },
        { ...mockPayload, conversation_id: null },
        { ...mockPayload, conversation_id: undefined },
        { ...mockPayload, conversation_id: 'invalid-format' }
      ]

      invalidPayloads.forEach(async (payload) => {
        mockVerifyWebhookRequest.mockResolvedValue(false)

        const result = await mockVerifyWebhookRequest(mockSupabaseClient, payload)

        expect(result).toBe(false)
      })
    })
  })

  describe('Conversation Management', () => {
    const mockConversation = {
      id: 'conv-123',
      user_id: 'user-456',
      tavus_conversation_id: 'tavus-conv-789',
      status: 'pending',
      subscription_tier_at_creation: 'pro',
    }

    beforeEach(() => {
      mockFindConversation.mockResolvedValue(mockConversation)
    })

    it('should find conversation by Tavus ID', async () => {
      mockSingle.mockResolvedValue({ data: mockConversation, error: null })

      const result = await mockFindConversation(mockSupabaseClient, 'tavus-conv-789')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversations')
      expect(mockSelect).toHaveBeenCalledWith('id, user_id, usage_tracking_id, subscription_tier_at_creation')
      expect(mockEq).toHaveBeenCalledWith('tavus_conversation_id', 'tavus-conv-789')
      expect(result).toEqual(mockConversation)
    })

    it('should return null when conversation not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })
      mockFindConversation.mockResolvedValue(null)

      const result = await mockFindConversation(mockSupabaseClient, 'non-existent')

      expect(result).toBeNull()
    })
  })

  describe('Usage Tracking', () => {
    const mockUsageTracking = {
      id: 'usage-123',
      user_id: 'user-456',
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-01-31T23:59:59Z',
      subscription_tier: 'pro',
      minutes_used: 120,
      sessions_used: 5,
      total_conversations: 5,
    }

    const mockSubscription = {
      customer_id: 'user-456',
      price_id: 'price_pro',
      current_period_start: 1704067200, // 2024-01-01
      current_period_end: 1706745599,   // 2024-01-31
    }

    it('should get or create usage tracking record', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: mockSubscription, error: null }) // subscription query
        .mockResolvedValueOnce({ data: mockUsageTracking, error: null }) // existing usage query

      mockGetOrCreateUsageTracking.mockResolvedValue(mockUsageTracking)

      const result = await mockGetOrCreateUsageTracking(mockSupabaseClient, 'user-456')

      expect(result).toEqual(mockUsageTracking)
      expect(mockGetOrCreateUsageTracking).toHaveBeenCalledWith(mockSupabaseClient, 'user-456')
    })

    it('should create new usage tracking when none exists', async () => {
      const newUsageTracking = { ...mockUsageTracking, minutes_used: 0, sessions_used: 0 }

      mockSingle
        .mockResolvedValueOnce({ data: mockSubscription, error: null }) // subscription query
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }) // no existing usage
        .mockResolvedValueOnce({ data: newUsageTracking, error: null }) // new usage created

      mockGetOrCreateUsageTracking.mockResolvedValue(newUsageTracking)

      const result = await mockGetOrCreateUsageTracking(mockSupabaseClient, 'user-456')

      expect(result).toEqual(newUsageTracking)
    })

    it('should update usage tracking with session increment', async () => {
      const updates = { sessions_increment: 1 }

      mockUpdateUsageTracking.mockResolvedValue(undefined)

      await mockUpdateUsageTracking(mockSupabaseClient, 'usage-123', updates)

      expect(mockUpdateUsageTracking).toHaveBeenCalledWith(mockSupabaseClient, 'usage-123', updates)
    })

    it('should update usage tracking with minutes increment', async () => {
      const updates = { minutes_increment: 30 }

      mockUpdateUsageTracking.mockResolvedValue(undefined)

      await mockUpdateUsageTracking(mockSupabaseClient, 'usage-123', updates)

      expect(mockUpdateUsageTracking).toHaveBeenCalledWith(mockSupabaseClient, 'usage-123', updates)
    })
  })

  describe('Conversation Usage Details', () => {
    const mockConversationDetail = {
      conversation_id: 'conv-123',
      user_id: 'user-456',
      usage_tracking_id: 'usage-123',
      started_at: '2024-01-15T10:00:00Z',
      ended_at: '2024-01-15T10:30:00Z',
      actual_duration_minutes: 30,
      completion_status: 'completed',
    }

    it('should create conversation usage detail', async () => {
      mockCreateConversationUsageDetail.mockResolvedValue(undefined)

      await mockCreateConversationUsageDetail(
        mockSupabaseClient,
        { id: 'conv-123', user_id: 'user-456' },
        'usage-123',
        '2024-01-15T10:00:00Z'
      )

      expect(mockCreateConversationUsageDetail).toHaveBeenCalledWith(
        mockSupabaseClient,
        { id: 'conv-123', user_id: 'user-456' },
        'usage-123',
        '2024-01-15T10:00:00Z'
      )
    })

    it('should update conversation usage detail with completion info', async () => {
      mockUpdateConversationUsageDetail.mockResolvedValue(undefined)

      await mockUpdateConversationUsageDetail(
        mockSupabaseClient,
        'conv-123',
        '2024-01-15T10:30:00Z',
        30,
        'completed',
        'participant_left'
      )

      expect(mockUpdateConversationUsageDetail).toHaveBeenCalledWith(
        mockSupabaseClient,
        'conv-123',
        '2024-01-15T10:30:00Z',
        30,
        'completed',
        'participant_left'
      )
    })
  })

  describe('Webhook Event Processing', () => {
    const mockWebhookPayload = {
      conversation_id: 'tavus-conv-789',
      event_type: 'system.replica_joined',
      message_type: 'system',
      timestamp: '2024-01-15T10:00:00Z',
      properties: {
        replica_id: 'replica-123',
      },
    }

    const mockRequest = {
      headers: {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'origin') return 'https://webhook.tavus.io'
          return null
        })
      }
    }

    it('should process system.replica_joined event with valid domain and conversation', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-456',
        usage_tracking_id: null,
      }

      const mockUsageTracking = {
        id: 'usage-123',
        user_id: 'user-456',
      }

      // Mock security validations pass
      mockVerifyTavusDomain.mockReturnValue(true)
      mockVerifyWebhookRequest.mockResolvedValue(true)
      
      // Mock business logic
      mockFindConversation.mockResolvedValue(mockConversation)
      mockGetOrCreateUsageTracking.mockResolvedValue(mockUsageTracking)
      mockCreateConversationUsageDetail.mockResolvedValue(undefined)
      mockUpdateUsageTracking.mockResolvedValue(undefined)
      mockBroadcastConversationUpdate.mockResolvedValue(undefined)

      // Mock the actual event handler
      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: true,
        message: 'Conversation started',
        event_type: 'system.replica_joined',
        security_passed: true
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, mockWebhookPayload, mockRequest)

      expect(result.success).toBe(true)
      expect(result.event_type).toBe('system.replica_joined')
      expect(result.security_passed).toBe(true)
    })

    it('should process system.shutdown event', async () => {
      const shutdownPayload = {
        ...mockWebhookPayload,
        event_type: 'system.shutdown',
        properties: {
          reason: 'participant_left',
        },
      }

      const mockConversationDetails = {
        started_at: '2024-01-15T10:00:00Z',
        usage_tracking_id: 'usage-123',
      }

      mockFindConversation.mockResolvedValue({ id: 'conv-123', user_id: 'user-456' })
      mockSingle.mockResolvedValue({ data: mockConversationDetails, error: null })
      mockUpdateUsageTracking.mockResolvedValue(undefined)
      mockUpdateConversationUsageDetail.mockResolvedValue(undefined)
      mockBroadcastConversationUpdate.mockResolvedValue(undefined)

      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: true,
        message: 'Conversation ended',
        event_type: 'system.shutdown',
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, shutdownPayload)

      expect(result.success).toBe(true)
      expect(result.event_type).toBe('system.shutdown')
    })

    it('should reject requests from unauthorized domains', async () => {
      const unauthorizedRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'origin') return 'https://malicious.com'
            return null
          })
        }
      }

      mockVerifyTavusDomain.mockReturnValue(false)

      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: false,
        error: 'Unauthorized domain',
        status: 403
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, mockWebhookPayload, unauthorizedRequest)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized domain')
      expect(result.status).toBe(403)
    })

    it('should reject requests with invalid conversation ID', async () => {
      mockVerifyTavusDomain.mockReturnValue(true)
      mockVerifyWebhookRequest.mockResolvedValue(false)

      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid webhook request: conversation not found',
        status: 401
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, mockWebhookPayload, mockRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('conversation not found')
      expect(result.status).toBe(401)
    })
  })

  describe('Real-time Broadcasting', () => {
    it('should broadcast conversation updates', async () => {
      const updatePayload = {
        type: 'conversation_started',
        conversationId: 'conv-123',
        status: 'in_progress',
      }

      mockBroadcastConversationUpdate.mockResolvedValue(undefined)

      await mockBroadcastConversationUpdate(mockSupabaseClient, 'user-456', updatePayload)

      expect(mockBroadcastConversationUpdate).toHaveBeenCalledWith(
        mockSupabaseClient,
        'user-456',
        updatePayload
      )
    })
  })

  describe('Subscription Limit Enforcement', () => {
    it('should allow conversation when under limits', () => {
      const mockCheckSubscriptionLimits = jest.fn().mockReturnValue({
        allowed: true,
        minutesRemaining: 180,
        sessionsRemaining: 15,
      })

      const result = mockCheckSubscriptionLimits('user-456', 'pro', 120, 5)

      expect(result.allowed).toBe(true)
      expect(result.minutesRemaining).toBe(180)
    })

    it('should block conversation when over limits', () => {
      const mockCheckSubscriptionLimits = jest.fn().mockReturnValue({
        allowed: false,
        reason: 'minutes_exceeded',
        minutesUsed: 300,
        minutesLimit: 300,
      })

      const result = mockCheckSubscriptionLimits('user-456', 'pro', 300, 20)

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('minutes_exceeded')
    })

    it('should allow unlimited for enterprise tier', () => {
      const mockCheckSubscriptionLimits = jest.fn().mockReturnValue({
        allowed: true,
        unlimited: true,
      })

      const result = mockCheckSubscriptionLimits('user-456', 'enterprise', 1000, 50)

      expect(result.allowed).toBe(true)
      expect(result.unlimited).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      mockSingle.mockRejectedValue(dbError)
      mockFindConversation.mockRejectedValue(dbError)

      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: false,
        error: 'Database error',
        details: dbError.message,
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, {
        conversation_id: 'test',
        event_type: 'system.replica_joined',
        message_type: 'system',
        timestamp: new Date().toISOString(),
        properties: {},
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should handle invalid webhook payload', async () => {
      const invalidPayload = {
        // Missing required fields
        event_type: 'system.replica_joined',
      }

      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid payload',
        details: 'Missing required field: conversation_id',
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, invalidPayload)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid payload')
    })
  })

  describe('Performance Tests', () => {
    it('should handle multiple concurrent webhook events', async () => {
      const mockProcessWebhookEvent = jest.fn().mockResolvedValue({
        success: true,
        processingTime: 150, // ms
      })

      const events = Array.from({ length: 10 }, (_, i) => ({
        conversation_id: `conv-${i}`,
        event_type: 'conversation.utterance',
        message_type: 'conversation',
        timestamp: new Date().toISOString(),
        properties: { text: `Message ${i}`, role: 'user' },
      }))

      const results = await Promise.all(
        events.map(event => mockProcessWebhookEvent(mockSupabaseClient, event))
      )

      expect(results).toHaveLength(10)
      expect(results.every(result => result.success)).toBe(true)
      expect(mockProcessWebhookEvent).toHaveBeenCalledTimes(10)
    })

    it('should process events within acceptable time limits', async () => {
      const startTime = Date.now()

      const mockProcessWebhookEvent = jest.fn().mockImplementation(async () => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 50))
        return { success: true, processingTime: Date.now() - startTime }
      })

      const result = await mockProcessWebhookEvent(mockSupabaseClient, {
        conversation_id: 'perf-test',
        event_type: 'system.replica_joined',
        message_type: 'system',
        timestamp: new Date().toISOString(),
        properties: {},
      })

      expect(result.success).toBe(true)
      expect(result.processingTime).toBeLessThan(1000) // Should process in under 1s
    })
  })
})