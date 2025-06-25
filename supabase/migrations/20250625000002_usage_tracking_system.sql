-- Migration: Subscription Usage Tracking System
-- Created: 2025-06-25
-- Description: Implements comprehensive usage tracking for subscription-based consultation limits

-- Subscription Limits Configuration Table
-- Defines limits for each subscription tier
CREATE TABLE IF NOT EXISTS subscription_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE, -- 'founder_essential', 'founder_companion', 'growth_partner', 'expert_advisor'
  price_id TEXT NOT NULL, -- Stripe price ID for matching
  
  -- Video consultation limits
  max_sessions_per_period INTEGER NOT NULL DEFAULT 0, -- Number of sessions allowed
  max_minutes_per_period INTEGER NOT NULL DEFAULT 0, -- Total minutes allowed
  max_minutes_per_session INTEGER DEFAULT 30, -- Max single session duration
  
  -- Document generation limits
  max_documents_per_period INTEGER DEFAULT 0, -- Number of documents allowed
  max_tokens_per_period INTEGER DEFAULT 0, -- Token allowance (0 = unlimited for BYOK)
  
  -- Feature flags
  allow_team_access BOOLEAN DEFAULT false,
  allow_custom_personas BOOLEAN DEFAULT false,
  allow_unlimited_tokens BOOLEAN DEFAULT false, -- For enterprise tiers
  
  -- Overage settings
  overage_rate_per_minute DECIMAL(10,2) DEFAULT 0.00, -- Cost per additional minute
  overage_rate_per_token DECIMAL(10,4) DEFAULT 0.00, -- Cost per additional token
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Usage Tracking Table
-- Tracks actual usage per user per billing period
CREATE TABLE IF NOT EXISTS user_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Billing period tracking
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  subscription_tier TEXT NOT NULL, -- Current tier during this period
  price_id TEXT, -- Stripe price ID for reference
  
  -- Video consultation usage
  sessions_used INTEGER DEFAULT 0,
  minutes_used INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  
  -- Document generation usage
  documents_generated INTEGER DEFAULT 0,
  tokens_consumed INTEGER DEFAULT 0,
  
  -- Overage tracking
  overage_minutes INTEGER DEFAULT 0,
  overage_tokens INTEGER DEFAULT 0,
  overage_amount DECIMAL(10,2) DEFAULT 0.00,
  
  -- Metadata
  last_conversation_at TIMESTAMPTZ,
  last_document_generated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per billing period
  UNIQUE(user_id, period_start, period_end)
);

-- Conversation Usage Details Table
-- Detailed tracking for each conversation
CREATE TABLE IF NOT EXISTS conversation_usage_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_tracking_id UUID NOT NULL REFERENCES user_usage_tracking(id) ON DELETE CASCADE,
  
  -- Conversation metrics
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  planned_duration_minutes INTEGER DEFAULT 30, -- Based on subscription tier
  actual_duration_minutes INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0, -- More precise tracking
  
  -- Usage classification
  is_within_limits BOOLEAN DEFAULT true,
  is_overage BOOLEAN DEFAULT false,
  overage_minutes INTEGER DEFAULT 0,
  overage_cost DECIMAL(10,2) DEFAULT 0.00,
  
  -- Session quality and completion
  completion_status TEXT DEFAULT 'in_progress', -- 'completed', 'terminated_by_user', 'terminated_by_limit', 'failed'
  termination_reason TEXT, -- 'limit_reached', 'user_ended', 'technical_issue'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Generation Usage Details Table
-- Detailed tracking for document generation
CREATE TABLE IF NOT EXISTS document_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_tracking_id UUID NOT NULL REFERENCES user_usage_tracking(id) ON DELETE CASCADE,
  
  -- Document generation metrics
  document_type TEXT NOT NULL, -- 'pitch_deck', 'business_plan', 'market_analysis', etc.
  tokens_used INTEGER NOT NULL DEFAULT 0,
  generation_cost DECIMAL(10,4) DEFAULT 0.00,
  
  -- Usage classification
  is_within_limits BOOLEAN DEFAULT true,
  is_overage BOOLEAN DEFAULT false,
  is_byok BOOLEAN DEFAULT false, -- User brought own API key
  
  -- Generation context
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  triggered_by TEXT DEFAULT 'manual', -- 'manual', 'conversation', 'automated'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_limits_tier ON subscription_limits(tier_name);
CREATE INDEX IF NOT EXISTS idx_subscription_limits_price_id ON subscription_limits(price_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON user_usage_tracking(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_current ON user_usage_tracking(user_id, period_end);

CREATE INDEX IF NOT EXISTS idx_conversation_usage_user ON conversation_usage_details(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_usage_tracking ON conversation_usage_details(usage_tracking_id);
CREATE INDEX IF NOT EXISTS idx_conversation_usage_status ON conversation_usage_details(completion_status);

CREATE INDEX IF NOT EXISTS idx_document_usage_user ON document_generation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_document_usage_tracking ON document_generation_usage(usage_tracking_id);
CREATE INDEX IF NOT EXISTS idx_document_usage_type ON document_generation_usage(document_type);

-- Row Level Security (RLS) policies
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_usage_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_generation_usage ENABLE ROW LEVEL SECURITY;

-- Users can view subscription limits (public data)
CREATE POLICY "Anyone can view subscription limits" 
  ON subscription_limits 
  FOR SELECT 
  USING (true);

-- Users can only view their own usage data
CREATE POLICY "Users can view own usage tracking" 
  ON user_usage_tracking 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own conversation usage" 
  ON conversation_usage_details 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own document usage" 
  ON document_generation_usage 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Service role can manage all usage data (for webhook updates)
CREATE POLICY "Service can manage usage tracking" 
  ON user_usage_tracking 
  FOR ALL 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service can manage conversation usage" 
  ON conversation_usage_details 
  FOR ALL 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service can manage document usage" 
  ON document_generation_usage 
  FOR ALL 
  WITH CHECK (auth.role() = 'service_role');

-- Insert default subscription tier limits
INSERT INTO subscription_limits (tier_name, price_id, max_sessions_per_period, max_minutes_per_period, max_minutes_per_session, max_documents_per_period, max_tokens_per_period, allow_team_access, allow_custom_personas) VALUES
  ('founder_essential', 'price_1Rd8NVD5a0uk1qUEQSEg8jCp', 2, 40, 20, 10, 25000, false, false),
  ('founder_essential_yearly', 'price_1Rd8NVD5a0uk1qUEQSEg8jCp_yearly', 2, 40, 20, 10, 25000, false, false),
  ('founder_companion', 'price_1Rd8NmD5a0uk1qUEF5N4AXbq', 3, 75, 25, 20, 50000, false, false),
  ('founder_companion_yearly', 'price_1Rd8NmD5a0uk1qUEF5N4AXbq_yearly', 3, 75, 25, 20, 50000, false, false),
  ('growth_partner', 'price_1Rd8O4D5a0uk1qUEb76A0qe2', 5, 150, 30, 40, 100000, true, true),
  ('growth_partner_yearly', 'price_1Rd8O4D5a0uk1qUEb76A0qe2_yearly', 5, 150, 30, 40, 100000, true, true),
  ('expert_advisor', 'price_1Rd8OKD5a0uk1qUEXnVvuqO9', 8, 240, 30, 0, 0, true, true),
  ('expert_advisor_yearly', 'price_1Rd8OKD5a0uk1qUEXnVvuqO9_yearly', 8, 240, 30, 0, 0, true, true)
ON CONFLICT (tier_name) DO UPDATE SET
  max_sessions_per_period = EXCLUDED.max_sessions_per_period,
  max_minutes_per_period = EXCLUDED.max_minutes_per_period,
  max_minutes_per_session = EXCLUDED.max_minutes_per_session,
  max_documents_per_period = EXCLUDED.max_documents_per_period,
  max_tokens_per_period = EXCLUDED.max_tokens_per_period,
  allow_team_access = EXCLUDED.allow_team_access,
  allow_custom_personas = EXCLUDED.allow_custom_personas,
  updated_at = NOW();

-- Update expert advisor tiers to have unlimited documents and tokens
UPDATE subscription_limits 
SET 
  max_documents_per_period = -1, -- -1 indicates unlimited
  max_tokens_per_period = -1,
  allow_unlimited_tokens = true,
  updated_at = NOW()
WHERE tier_name LIKE 'expert_advisor%';

-- Add usage tracking fields to existing conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS usage_tracking_id UUID REFERENCES user_usage_tracking(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS planned_duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS actual_duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_within_subscription_limits BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscription_tier_at_creation TEXT;

-- Add usage tracking fields to existing generated_documents table
ALTER TABLE generated_documents 
ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_within_token_limits BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS generation_cost DECIMAL(10,4) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_byok BOOLEAN DEFAULT false;

-- Grant necessary permissions
GRANT SELECT ON subscription_limits TO authenticated;
GRANT SELECT ON user_usage_tracking TO authenticated;
GRANT SELECT ON conversation_usage_details TO authenticated;
GRANT SELECT ON document_generation_usage TO authenticated;

GRANT ALL ON subscription_limits TO service_role;
GRANT ALL ON user_usage_tracking TO service_role;
GRANT ALL ON conversation_usage_details TO service_role;
GRANT ALL ON document_generation_usage TO service_role;

-- Add helpful comments
COMMENT ON TABLE subscription_limits IS 'Defines usage limits for each subscription tier including video minutes, document generation, and feature access';
COMMENT ON TABLE user_usage_tracking IS 'Tracks actual usage per user per billing period with overage calculations';
COMMENT ON TABLE conversation_usage_details IS 'Detailed tracking for each video consultation session';
COMMENT ON TABLE document_generation_usage IS 'Detailed tracking for document generation with token usage';

COMMENT ON COLUMN subscription_limits.max_sessions_per_period IS 'Number of video sessions allowed per billing period';
COMMENT ON COLUMN subscription_limits.max_minutes_per_period IS 'Total video minutes allowed per billing period';
COMMENT ON COLUMN subscription_limits.max_tokens_per_period IS 'Token allowance for document generation (0 = unlimited with BYOK)';
COMMENT ON COLUMN user_usage_tracking.overage_amount IS 'Total overage charges for the billing period';
COMMENT ON COLUMN conversation_usage_details.is_within_limits IS 'Whether this conversation was within subscription limits';
COMMENT ON COLUMN document_generation_usage.is_byok IS 'Whether user provided their own API key for generation';