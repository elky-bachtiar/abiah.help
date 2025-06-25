import { supabase } from '../lib/supabase';

export interface ValidationRequest {
  user_id: string;
  action_type: 'conversation' | 'document_generation';
  estimated_duration_minutes?: number;
  estimated_tokens?: number;
  document_type?: string;
}

export interface ValidationResponse {
  allowed: boolean;
  subscription_status: string;
  current_usage: {
    sessions_used: number;
    minutes_used: number;
    documents_generated: number;
    tokens_consumed: number;
  };
  limits: {
    max_sessions: number;
    max_minutes: number;
    max_documents: number;
    max_tokens: number;
  };
  remaining: {
    sessions: number;
    minutes: number;
    documents: number;
    tokens: number;
  };
  warnings?: string[];
  errors?: string[];
  upgrade_required: boolean;
  tier_info: {
    current_tier: string;
    allows_team_access: boolean;
    allows_custom_personas: boolean;
    allows_unlimited_tokens: boolean;
  };
}

/**
 * Validate if a user can perform an action based on their subscription limits
 */
export async function validateSubscriptionUsage(
  request: ValidationRequest
): Promise<ValidationResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-validator', {
      body: request,
    });

    if (error) {
      console.error('Subscription validation error:', error);
      throw new Error(`Validation failed: ${error.message}`);
    }

    return data as ValidationResponse;
  } catch (error) {
    console.error('Error calling subscription validator:', error);
    throw error;
  }
}

/**
 * Check if user can start a conversation
 */
export async function canStartConversation(
  userId: string,
  estimatedDurationMinutes: number = 30
): Promise<ValidationResponse> {
  return validateSubscriptionUsage({
    user_id: userId,
    action_type: 'conversation',
    estimated_duration_minutes: estimatedDurationMinutes,
  });
}

/**
 * Check if user can generate a document
 */
export async function canGenerateDocument(
  userId: string,
  documentType: string,
  estimatedTokens: number = 2000
): Promise<ValidationResponse> {
  return validateSubscriptionUsage({
    user_id: userId,
    action_type: 'document_generation',
    document_type: documentType,
    estimated_tokens: estimatedTokens,
  });
}

/**
 * Get current usage summary for a user
 */
export async function getUserUsageSummary(userId: string): Promise<ValidationResponse> {
  // We can reuse the validation endpoint to get usage summary
  // by making a dummy request that won't affect anything
  return validateSubscriptionUsage({
    user_id: userId,
    action_type: 'conversation',
    estimated_duration_minutes: 0, // No actual action
  });
}

/**
 * Hook for subscription validation with React Query
 */
export function useSubscriptionValidation() {
  const validateConversation = async (userId: string, duration?: number) => {
    return canStartConversation(userId, duration);
  };

  const validateDocumentGeneration = async (
    userId: string,
    documentType: string,
    tokens?: number
  ) => {
    return canGenerateDocument(userId, documentType, tokens);
  };

  const getUsageSummary = async (userId: string) => {
    return getUserUsageSummary(userId);
  };

  return {
    validateConversation,
    validateDocumentGeneration,
    getUsageSummary,
  };
}

/**
 * Format validation errors and warnings for display
 */
export function formatValidationMessages(validation: ValidationResponse): {
  errors: string[];
  warnings: string[];
  hasErrors: boolean;
  hasWarnings: boolean;
} {
  return {
    errors: validation.errors || [],
    warnings: validation.warnings || [],
    hasErrors: Boolean(validation.errors && validation.errors.length > 0),
    hasWarnings: Boolean(validation.warnings && validation.warnings.length > 0),
  };
}

/**
 * Get upgrade suggestions based on validation response
 */
export function getUpgradeSuggestions(validation: ValidationResponse): {
  shouldUpgrade: boolean;
  recommendedTier?: string;
  benefits: string[];
} {
  if (!validation.upgrade_required) {
    return {
      shouldUpgrade: false,
      benefits: [],
    };
  }

  const currentTier = validation.tier_info.current_tier;
  let recommendedTier = '';
  let benefits: string[] = [];

  // Suggest upgrades based on current tier
  if (currentTier === 'founder_essential' || currentTier === 'none') {
    recommendedTier = 'Founder Companion';
    benefits = [
      '3 × 25-minute video sessions (75 minutes total)',
      '50,000 tokens for document generation',
      'Priority AI responses (<30 seconds)',
      'Session recordings with insights',
    ];
  } else if (currentTier === 'founder_companion') {
    recommendedTier = 'Growth Partner';
    benefits = [
      '5 × 30-minute video sessions (150 minutes total)',
      '100,000 tokens for document generation',
      'Team access for up to 3 members',
      'Industry-specific AI mentors',
      'Real-time collaboration features',
    ];
  } else if (currentTier === 'growth_partner') {
    recommendedTier = 'Expert Advisor';
    benefits = [
      '8 × 30-minute video sessions (240 minutes total)',
      'Unlimited document generation',
      'Unlimited team access',
      'Specialized AI advisors (legal, finance, product)',
      '24/7 crisis support',
      'Custom AI mentor training',
    ];
  }

  return {
    shouldUpgrade: true,
    recommendedTier,
    benefits,
  };
}