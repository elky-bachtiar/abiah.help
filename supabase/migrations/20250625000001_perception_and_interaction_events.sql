-- Migration: Add perception and interaction event tables
-- Created: 2025-06-25
-- Description: Adds tables to store Tavus perception tool calls and live interaction events

-- Conversation Perception Events Table
-- Stores visual context analysis and perception tool calls
CREATE TABLE IF NOT EXISTS conversation_perception_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('perception_tool_call', 'perception_analysis')),
  visual_context TEXT,
  detected_objects TEXT[],
  analysis_result TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  inference_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Interaction Events Table  
-- Stores live interaction events like echo, respond, interrupt, etc.
CREATE TABLE IF NOT EXISTS conversation_interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'conversation.echo', 
    'conversation.respond', 
    'conversation.sensitivity', 
    'conversation.interrupt', 
    'conversation.replica_interrupted',
    'conversation.overwrite_context'
  )),
  interaction_data JSONB NOT NULL DEFAULT '{}',
  inference_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_perception_events_conversation_id 
  ON conversation_perception_events(conversation_id);

CREATE INDEX IF NOT EXISTS idx_perception_events_event_type 
  ON conversation_perception_events(event_type);

CREATE INDEX IF NOT EXISTS idx_perception_events_timestamp 
  ON conversation_perception_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_interaction_events_conversation_id 
  ON conversation_interaction_events(conversation_id);

CREATE INDEX IF NOT EXISTS idx_interaction_events_event_type 
  ON conversation_interaction_events(event_type);

CREATE INDEX IF NOT EXISTS idx_interaction_events_timestamp 
  ON conversation_interaction_events(timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE conversation_perception_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_interaction_events ENABLE ROW LEVEL SECURITY;

-- Users can view perception events for their own conversations
CREATE POLICY "Users can view own perception events" 
  ON conversation_perception_events 
  FOR SELECT 
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Users can view interaction events for their own conversations  
CREATE POLICY "Users can view own interaction events"
  ON conversation_interaction_events
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Service role can insert perception events (for webhook)
CREATE POLICY "Service can insert perception events"
  ON conversation_perception_events
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Service role can insert interaction events (for webhook)
CREATE POLICY "Service can insert interaction events" 
  ON conversation_interaction_events
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Add retry tracking columns to conversation_events table
ALTER TABLE conversation_events 
ADD COLUMN IF NOT EXISTS processing_attempts INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_processing_error TEXT;

-- Add recording and perception analysis fields to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS recording_duration INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Webhook Processing Failures Table
-- Stores failed webhook processing attempts for manual review
CREATE TABLE IF NOT EXISTS webhook_processing_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT NOT NULL,
  retry_attempts INTEGER NOT NULL DEFAULT 1,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for webhook failures
CREATE INDEX IF NOT EXISTS idx_webhook_failures_conversation_id 
  ON webhook_processing_failures(conversation_id);

CREATE INDEX IF NOT EXISTS idx_webhook_failures_event_type 
  ON webhook_processing_failures(event_type);

CREATE INDEX IF NOT EXISTS idx_webhook_failures_failed_at 
  ON webhook_processing_failures(failed_at);

CREATE INDEX IF NOT EXISTS idx_webhook_failures_resolved 
  ON webhook_processing_failures(resolved);

-- RLS for webhook failures
ALTER TABLE webhook_processing_failures ENABLE ROW LEVEL SECURITY;

-- Service role can manage webhook failures
CREATE POLICY "Service can manage webhook failures"
  ON webhook_processing_failures
  FOR ALL
  WITH CHECK (auth.role() = 'service_role');

-- Users can view webhook failures for their conversations
CREATE POLICY "Users can view webhook failures for own conversations"
  ON webhook_processing_failures
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT tavus_conversation_id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT ON conversation_perception_events TO authenticated;
GRANT SELECT ON conversation_interaction_events TO authenticated;
GRANT ALL ON conversation_perception_events TO service_role;
GRANT ALL ON conversation_interaction_events TO service_role;
GRANT SELECT ON webhook_processing_failures TO authenticated;
GRANT ALL ON webhook_processing_failures TO service_role;

-- Add comments for documentation
COMMENT ON TABLE conversation_perception_events IS 'Stores Tavus perception tool calls and visual context analysis events';
COMMENT ON TABLE conversation_interaction_events IS 'Stores live interaction events like echo, respond, interrupt during conversations';

COMMENT ON COLUMN conversation_perception_events.visual_context IS 'Description of visual context detected by perception tools';
COMMENT ON COLUMN conversation_perception_events.detected_objects IS 'Array of objects detected in visual context';
COMMENT ON COLUMN conversation_perception_events.analysis_result IS 'Result of perception analysis processing';
COMMENT ON COLUMN conversation_perception_events.confidence_score IS 'Confidence score for perception analysis (0-1)';

COMMENT ON COLUMN conversation_interaction_events.interaction_data IS 'JSON data containing interaction-specific properties like text, reason, action, new_context';