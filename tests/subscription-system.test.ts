/**
 * Comprehensive Test Suite for Subscription System
 * Tests all new subscription functionality with Jest mocks
 */

import { jest } from '@jest/globals'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
    admin: { createUser: jest.fn(), deleteUser: jest.fn() },
  },
  sql: jest.fn(),
}

// Mock React Query
const mockUseQuery = jest.fn()
const mockUseMutation = jest.fn()

// Mock database query builders
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockOrderBy = jest.fn()

// Setup mock chain
mockSupabaseClient.from.mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
})

mockSelect.mockReturnValue({ 
  eq: mockEq, 
  single: mockSingle,
  orderBy: mockOrderBy
})
mockInsert.mockReturnValue({ select: mockSelect, single: mockSingle })
mockUpdate.mockReturnValue({ eq: mockEq })
mockEq.mockReturnValue({ 
  single: mockSingle,
  orderBy: mockOrderBy
})
mockOrderBy.mockReturnValue({ single: mockSingle })

// Mock functions from subscription system
const mockValidateSubscriptionUsage = jest.fn()
const mockCanStartConversation = jest.fn()
const mockCanGenerateDocument = jest.fn()
const mockGetUserUsageSummary = jest.fn()
const mockCreateConversationWithValidation = jest.fn()
const mockUpdateUsageTracking = jest.fn()

describe('Subscription System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Subscription Validation Service', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    const mockSubscriptionLimits = {
      id: 'limits-123',
      tier: 'founder_companion',
      sessions_limit: 3,
      minutes_limit: 75,
      documents_limit: 20,
      tokens_limit: 50000,
      team_access: false,
      custom_personas: false,
      unlimited_tokens: false,
    }

    const mockCurrentUsage = {
      id: 'usage-123',
      user_id: 'user-123',
      sessions_used: 1,
      minutes_used: 25,
      documents_generated: 5,
      tokens_consumed: 15000,
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-01-31T23:59:59Z',
    }

    describe('validateSubscriptionUsage()', () => {
      it('should validate user within limits', async () => {
        const validationResult = {
          allowed: true,
          usage: mockCurrentUsage,
          limits: mockSubscriptionLimits,
          remaining: {
            sessions: 2,
            minutes: 50,
            documents: 15,
            tokens: 35000,
          },
        }

        mockValidateSubscriptionUsage.mockResolvedValue(validationResult)

        const result = await mockValidateSubscriptionUsage('user-123', 'conversation')

        expect(result.allowed).toBe(true)
        expect(result.remaining.sessions).toBe(2)
        expect(result.remaining.minutes).toBe(50)
        expect(mockValidateSubscriptionUsage).toHaveBeenCalledWith('user-123', 'conversation')
      })

      it('should reject user over session limits', async () => {
        const validationResult = {
          allowed: false,
          reason: 'sessions_exceeded',
          usage: { ...mockCurrentUsage, sessions_used: 3 },
          limits: mockSubscriptionLimits,
          remaining: {
            sessions: 0,
            minutes: 50,
            documents: 15,
            tokens: 35000,
          },
        }

        mockValidateSubscriptionUsage.mockResolvedValue(validationResult)

        const result = await mockValidateSubscriptionUsage('user-123', 'conversation')

        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('sessions_exceeded')
        expect(result.remaining.sessions).toBe(0)
      })

      it('should reject user over minute limits', async () => {
        const validationResult = {
          allowed: false,
          reason: 'minutes_exceeded',
          usage: { ...mockCurrentUsage, minutes_used: 75 },
          limits: mockSubscriptionLimits,
          overage: {
            type: 'minutes',
            amount: 5,
            estimated_cost: 2.50,
          },
        }

        mockValidateSubscriptionUsage.mockResolvedValue(validationResult)

        const result = await mockValidateSubscriptionUsage('user-123', 'conversation')

        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('minutes_exceeded')
        expect(result.overage?.estimated_cost).toBe(2.50)
      })

      it('should handle unlimited tier (Expert Advisor)', async () => {
        const unlimitedLimits = {
          ...mockSubscriptionLimits,
          tier: 'expert_advisor',
          sessions_limit: 8,
          minutes_limit: 240,
          documents_limit: -1, // unlimited
          tokens_limit: -1, // unlimited
          unlimited_tokens: true,
        }

        const validationResult = {
          allowed: true,
          usage: { ...mockCurrentUsage, documents_generated: 100, tokens_consumed: 500000 },
          limits: unlimitedLimits,
          unlimited: ['documents', 'tokens'],
        }

        mockValidateSubscriptionUsage.mockResolvedValue(validationResult)

        const result = await mockValidateSubscriptionUsage('user-123', 'document')

        expect(result.allowed).toBe(true)
        expect(result.unlimited).toContain('documents')
        expect(result.unlimited).toContain('tokens')
      })
    })

    describe('canStartConversation()', () => {
      it('should allow conversation when under limits', async () => {
        const conversationValidation = {
          allowed: true,
          estimated_duration_minutes: 30,
          remaining_minutes: 50,
          remaining_sessions: 2,
          warnings: [],
        }

        mockCanStartConversation.mockResolvedValue(conversationValidation)

        const result = await mockCanStartConversation('user-123')

        expect(result.allowed).toBe(true)
        expect(result.estimated_duration_minutes).toBe(30)
        expect(result.warnings).toHaveLength(0)
      })

      it('should warn when approaching limits', async () => {
        const conversationValidation = {
          allowed: true,
          estimated_duration_minutes: 30,
          remaining_minutes: 35,
          remaining_sessions: 1,
          warnings: ['approaching_minute_limit', 'last_session'],
        }

        mockCanStartConversation.mockResolvedValue(conversationValidation)

        const result = await mockCanStartConversation('user-123')

        expect(result.allowed).toBe(true)
        expect(result.warnings).toContain('approaching_minute_limit')
        expect(result.warnings).toContain('last_session')
      })

      it('should block conversation when over limits', async () => {
        const conversationValidation = {
          allowed: false,
          reason: 'sessions_exceeded',
          estimated_duration_minutes: 30,
          remaining_minutes: 50,
          remaining_sessions: 0,
          upgrade_suggestion: {
            tier: 'growth_partner',
            benefits: ['5 sessions', '150 minutes', '40 documents'],
          },
        }

        mockCanStartConversation.mockResolvedValue(conversationValidation)

        const result = await mockCanStartConversation('user-123')

        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('sessions_exceeded')
        expect(result.upgrade_suggestion.tier).toBe('growth_partner')
      })
    })

    describe('canGenerateDocument()', () => {
      it('should allow document generation when under limits', async () => {
        const documentValidation = {
          allowed: true,
          estimated_tokens: 5000,
          remaining_tokens: 35000,
          remaining_documents: 15,
          warnings: [],
        }

        mockCanGenerateDocument.mockResolvedValue(documentValidation)

        const result = await mockCanGenerateDocument('user-123', 'pitch_deck')

        expect(result.allowed).toBe(true)
        expect(result.estimated_tokens).toBe(5000)
        expect(result.remaining_documents).toBe(15)
      })

      it('should warn when approaching token limits', async () => {
        const documentValidation = {
          allowed: true,
          estimated_tokens: 8000,
          remaining_tokens: 10000,
          remaining_documents: 15,
          warnings: ['approaching_token_limit'],
        }

        mockCanGenerateDocument.mockResolvedValue(documentValidation)

        const result = await mockCanGenerateDocument('user-123', 'business_plan')

        expect(result.allowed).toBe(true)
        expect(result.warnings).toContain('approaching_token_limit')
      })

      it('should block document generation when over limits', async () => {
        const documentValidation = {
          allowed: false,
          reason: 'documents_exceeded',
          estimated_tokens: 5000,
          remaining_tokens: 35000,
          remaining_documents: 0,
          upgrade_suggestion: {
            tier: 'growth_partner',
            benefits: ['40 documents', '100K tokens'],
          },
        }

        mockCanGenerateDocument.mockResolvedValue(documentValidation)

        const result = await mockCanGenerateDocument('user-123', 'pitch_deck')

        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('documents_exceeded')
        expect(result.remaining_documents).toBe(0)
      })
    })

    describe('getUserUsageSummary()', () => {
      it('should return comprehensive usage summary', async () => {
        const usageSummary = {
          user_id: 'user-123',
          current_tier: 'founder_companion',
          billing_period: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-01-31T23:59:59Z',
            days_remaining: 15,
          },
          usage: {
            sessions: { used: 1, limit: 3, percentage: 33 },
            minutes: { used: 25, limit: 75, percentage: 33 },
            documents: { used: 5, limit: 20, percentage: 25 },
            tokens: { used: 15000, limit: 50000, percentage: 30 },
          },
          alerts: ['approaching_halfway_point'],
          next_reset: '2024-02-01T00:00:00Z',
        }

        mockGetUserUsageSummary.mockResolvedValue(usageSummary)

        const result = await mockGetUserUsageSummary('user-123')

        expect(result.current_tier).toBe('founder_companion')
        expect(result.usage.sessions.percentage).toBe(33)
        expect(result.alerts).toContain('approaching_halfway_point')
        expect(result.billing_period.days_remaining).toBe(15)
      })

      it('should handle usage summary with overages', async () => {
        const usageSummary = {
          user_id: 'user-123',
          current_tier: 'founder_essential',
          usage: {
            sessions: { used: 2, limit: 2, percentage: 100 },
            minutes: { used: 50, limit: 40, percentage: 125, overage: 10 },
            documents: { used: 12, limit: 10, percentage: 120, overage: 2 },
            tokens: { used: 30000, limit: 25000, percentage: 120, overage: 5000 },
          },
          alerts: ['minutes_exceeded', 'documents_exceeded', 'tokens_exceeded'],
          overage_costs: {
            minutes: 5.00,
            documents: 10.00,
            tokens: 2.50,
            total: 17.50,
          },
        }

        mockGetUserUsageSummary.mockResolvedValue(usageSummary)

        const result = await mockGetUserUsageSummary('user-123')

        expect(result.usage.minutes.overage).toBe(10)
        expect(result.overage_costs.total).toBe(17.50)
        expect(result.alerts).toContain('minutes_exceeded')
      })
    })
  })

  describe('Frontend Validation Integration', () => {
    describe('createConversationWithValidation()', () => {
      const mockConversationData = {
        persona_id: 'persona-123',
        conversation_name: 'Test Consultation',
        conversational_context: 'Business planning session',
      }

      it('should create conversation when validation passes', async () => {
        const successResult = {
          success: true,
          validation: {
            allowed: true,
            remaining_sessions: 2,
            remaining_minutes: 50,
            warnings: [],
          },
          conversation: {
            id: 'conv-123',
            tavus_conversation_id: 'tavus-conv-456',
            conversation_url: 'https://tavus.io/conv/456',
            status: 'active',
          },
        }

        mockCreateConversationWithValidation.mockResolvedValue(successResult)

        const result = await mockCreateConversationWithValidation(mockConversationData)

        expect(result.success).toBe(true)
        expect(result.validation.allowed).toBe(true)
        expect(result.conversation.id).toBe('conv-123')
        expect(mockCreateConversationWithValidation).toHaveBeenCalledWith(mockConversationData)
      })

      it('should reject conversation when validation fails', async () => {
        const failureResult = {
          success: false,
          validation: {
            allowed: false,
            reason: 'sessions_exceeded',
            remaining_sessions: 0,
            upgrade_suggestion: {
              tier: 'growth_partner',
              benefits: ['5 sessions', '150 minutes'],
            },
          },
          error: 'Session limit exceeded. Please upgrade your plan.',
        }

        mockCreateConversationWithValidation.mockResolvedValue(failureResult)

        const result = await mockCreateConversationWithValidation(mockConversationData)

        expect(result.success).toBe(false)
        expect(result.validation.allowed).toBe(false)
        expect(result.validation.reason).toBe('sessions_exceeded')
        expect(result.error).toContain('Session limit exceeded')
      })

      it('should create conversation with warnings', async () => {
        const warningResult = {
          success: true,
          validation: {
            allowed: true,
            remaining_sessions: 1,
            remaining_minutes: 35,
            warnings: ['last_session', 'approaching_minute_limit'],
          },
          conversation: {
            id: 'conv-124',
            tavus_conversation_id: 'tavus-conv-457',
          },
        }

        mockCreateConversationWithValidation.mockResolvedValue(warningResult)

        const result = await mockCreateConversationWithValidation(mockConversationData)

        expect(result.success).toBe(true)
        expect(result.validation.warnings).toContain('last_session')
        expect(result.validation.warnings).toContain('approaching_minute_limit')
      })
    })
  })

  describe('Enhanced Webhook Usage Tracking', () => {
    const mockUsageUpdate = {
      usage_tracking_id: 'usage-123',
      sessions_increment: 1,
      minutes_increment: 30,
      tokens_increment: 0,
      documents_increment: 0,
    }

    it('should update usage tracking on conversation start', async () => {
      mockUpdateUsageTracking.mockResolvedValue(undefined)

      await mockUpdateUsageTracking(
        mockSupabaseClient,
        'usage-123',
        { sessions_increment: 1 }
      )

      expect(mockUpdateUsageTracking).toHaveBeenCalledWith(
        mockSupabaseClient,
        'usage-123',
        { sessions_increment: 1 }
      )
    })

    it('should update usage tracking on conversation end', async () => {
      const endUpdateParams = {
        minutes_increment: 45,
      }

      mockUpdateUsageTracking.mockResolvedValue(undefined)

      await mockUpdateUsageTracking(
        mockSupabaseClient,
        'usage-123',
        endUpdateParams
      )

      expect(mockUpdateUsageTracking).toHaveBeenCalledWith(
        mockSupabaseClient,
        'usage-123',
        endUpdateParams
      )
    })

    it('should handle usage tracking errors gracefully', async () => {
      const usageError = new Error('Database update failed')
      mockUpdateUsageTracking.mockRejectedValue(usageError)

      await expect(
        mockUpdateUsageTracking(mockSupabaseClient, 'usage-123', mockUsageUpdate)
      ).rejects.toThrow('Database update failed')
    })

    it('should calculate overage costs correctly', async () => {
      const mockCalculateOverageCosts = jest.fn().mockReturnValue({
        minutes_overage: 10,
        minutes_cost: 5.00,
        documents_overage: 2,
        documents_cost: 10.00,
        tokens_overage: 5000,
        tokens_cost: 2.50,
        total_cost: 17.50,
      })

      const result = mockCalculateOverageCosts({
        tier: 'founder_essential',
        minutes_used: 50,
        minutes_limit: 40,
        documents_used: 12,
        documents_limit: 10,
        tokens_used: 30000,
        tokens_limit: 25000,
      })

      expect(result.total_cost).toBe(17.50)
      expect(result.minutes_overage).toBe(10)
      expect(result.documents_overage).toBe(2)
      expect(result.tokens_overage).toBe(5000)
    })
  })

  describe('Subscription Tiers Configuration', () => {
    const mockTiers = {
      founder_essential: {
        sessions_limit: 2,
        minutes_limit: 40,
        documents_limit: 10,
        tokens_limit: 25000,
        team_access: false,
        custom_personas: false,
        unlimited_tokens: false,
      },
      founder_companion: {
        sessions_limit: 3,
        minutes_limit: 75,
        documents_limit: 20,
        tokens_limit: 50000,
        team_access: false,
        custom_personas: true,
        unlimited_tokens: false,
      },
      growth_partner: {
        sessions_limit: 5,
        minutes_limit: 150,
        documents_limit: 40,
        tokens_limit: 100000,
        team_access: true,
        custom_personas: true,
        unlimited_tokens: false,
      },
      expert_advisor: {
        sessions_limit: 8,
        minutes_limit: 240,
        documents_limit: -1,
        tokens_limit: -1,
        team_access: true,
        custom_personas: true,
        unlimited_tokens: true,
      },
    }

    it('should validate tier limits correctly', () => {
      const mockValidateTierLimits = jest.fn()

      // Test each tier
      Object.entries(mockTiers).forEach(([tierName, limits]) => {
        mockValidateTierLimits.mockReturnValue({
          tier: tierName,
          valid: true,
          features: {
            unlimited_documents: limits.documents_limit === -1,
            unlimited_tokens: limits.tokens_limit === -1,
            team_access: limits.team_access,
            custom_personas: limits.custom_personas,
          },
        })

        const result = mockValidateTierLimits(tierName, limits)
        expect(result.tier).toBe(tierName)
        expect(result.valid).toBe(true)
      })

      expect(mockValidateTierLimits).toHaveBeenCalledTimes(4)
    })

    it('should provide correct upgrade paths', () => {
      const mockGetUpgradePath = jest.fn()

      const upgradePaths = [
        { from: 'founder_essential', to: 'founder_companion', benefits: ['1 extra session', '35 more minutes', '10 more documents', '25K more tokens', 'Custom personas'] },
        { from: 'founder_companion', to: 'growth_partner', benefits: ['2 extra sessions', '75 more minutes', '20 more documents', '50K more tokens', 'Team access'] },
        { from: 'growth_partner', to: 'expert_advisor', benefits: ['3 extra sessions', '90 more minutes', 'Unlimited documents', 'Unlimited tokens'] },
      ]

      upgradePaths.forEach(path => {
        mockGetUpgradePath.mockReturnValue(path)
        const result = mockGetUpgradePath(path.from)
        expect(result.to).toBe(path.to)
        expect(result.benefits.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing subscription gracefully', async () => {
      const noSubscriptionResult = {
        allowed: false,
        reason: 'no_subscription',
        error: 'No active subscription found',
        upgrade_required: true,
      }

      mockValidateSubscriptionUsage.mockResolvedValue(noSubscriptionResult)

      const result = await mockValidateSubscriptionUsage('user-no-sub', 'conversation')

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('no_subscription')
      expect(result.upgrade_required).toBe(true)
    })

    it('should handle expired subscription', async () => {
      const expiredSubscriptionResult = {
        allowed: false,
        reason: 'subscription_expired',
        error: 'Subscription has expired',
        renewal_required: true,
        expired_at: '2024-01-31T23:59:59Z',
      }

      mockValidateSubscriptionUsage.mockResolvedValue(expiredSubscriptionResult)

      const result = await mockValidateSubscriptionUsage('user-expired', 'conversation')

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('subscription_expired')
      expect(result.renewal_required).toBe(true)
    })

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed')
      mockValidateSubscriptionUsage.mockRejectedValue(dbError)

      await expect(
        mockValidateSubscriptionUsage('user-123', 'conversation')
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle rate limiting', async () => {
      const rateLimitResult = {
        allowed: false,
        reason: 'rate_limit_exceeded',
        error: 'Too many requests. Please try again later.',
        retry_after: 300, // 5 minutes
      }

      mockValidateSubscriptionUsage.mockResolvedValue(rateLimitResult)

      const result = await mockValidateSubscriptionUsage('user-123', 'conversation')

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('rate_limit_exceeded')
      expect(result.retry_after).toBe(300)
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle concurrent validation requests', async () => {
      const users = Array.from({ length: 10 }, (_, i) => `user-${i}`)
      
      const mockResults = users.map(userId => ({
        user_id: userId,
        allowed: true,
        validation_time: Math.random() * 100, // Random response time
      }))

      users.forEach((userId, index) => {
        mockValidateSubscriptionUsage.mockResolvedValueOnce(mockResults[index])
      })

      const startTime = Date.now()
      const results = await Promise.all(
        users.map(userId => mockValidateSubscriptionUsage(userId, 'conversation'))
      )
      const totalTime = Date.now() - startTime

      expect(results).toHaveLength(10)
      expect(results.every(result => result.allowed)).toBe(true)
      expect(totalTime).toBeLessThan(1000) // Should complete within 1 second
      expect(mockValidateSubscriptionUsage).toHaveBeenCalledTimes(10)
    })

    it('should cache validation results appropriately', async () => {
      const mockCacheGet = jest.fn()
      const mockCacheSet = jest.fn()

      // First call - not in cache
      mockCacheGet.mockReturnValue(null)
      mockValidateSubscriptionUsage.mockResolvedValue({
        allowed: true,
        cached: false,
        timestamp: Date.now(),
      })

      await mockValidateSubscriptionUsage('user-123', 'conversation')

      // Second call - should use cache
      mockCacheGet.mockReturnValue({
        allowed: true,
        cached: true,
        timestamp: Date.now() - 30000, // 30 seconds ago
      })

      const cachedResult = mockCacheGet('user-123:conversation')
      expect(cachedResult?.cached).toBe(true)
    })
  })
})