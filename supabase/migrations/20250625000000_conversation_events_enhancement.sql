/*
  # Enhanced Conversation Events and Analysis Schema

  1. New Tables
    - `conversation_utterances`: Real-time conversation utterances
    - `conversation_tool_calls`: Tool call executions during conversations
    - `conversation_analysis`: Analysis results for conversations

  2. Table Updates
    - Add missing columns to existing tables for enhanced functionality
    - Add timing fields for conversations

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
*/

-- Add timing columns to conversations table if they don't exist
DO $$
BEGIN
  -- Add started_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add ended_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'ended_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Real-time conversation utterances
CREATE TABLE IF NOT EXISTS conversation_utterances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    inference_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool calls during conversations
CREATE TABLE IF NOT EXISTS conversation_tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    function_name TEXT NOT NULL,
    function_arguments TEXT,
    inference_id TEXT,
    execution_result JSONB,
    success BOOLEAN DEFAULT NULL,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced document generation opportunities with analysis metadata
DO $$
BEGIN
  -- Add analysis_metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'document_generation_opportunities' AND column_name = 'analysis_metadata'
  ) THEN
    ALTER TABLE document_generation_opportunities ADD COLUMN analysis_metadata JSONB;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_utterances_conversation_id ON conversation_utterances(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_utterances_timestamp ON conversation_utterances(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversation_tool_calls_conversation_id ON conversation_tool_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_tool_calls_timestamp ON conversation_tool_calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_conversations_ended_at ON conversations(ended_at);

-- Enable Row Level Security
ALTER TABLE conversation_utterances ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_tool_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_utterances
CREATE POLICY "Users can view their own conversation utterances"
  ON conversation_utterances
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_utterances.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert conversation utterances"
  ON conversation_utterances
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policies for conversation_tool_calls
CREATE POLICY "Users can view their own conversation tool calls"
  ON conversation_tool_calls
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_tool_calls.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert conversation tool calls"
  ON conversation_tool_calls
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role policies for updating conversations (for webhook)
CREATE POLICY "Service role can update conversations"
  ON conversations
  FOR UPDATE
  TO service_role
  USING (true);

-- Service role policies for inserting into conversation_events
CREATE POLICY "Service role can insert conversation events"
  ON conversation_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update conversation events"
  ON conversation_events
  FOR UPDATE
  TO service_role
  USING (true);

-- Service role policies for conversation transcripts
CREATE POLICY "Service role can insert conversation transcripts"
  ON conversation_transcripts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role policies for document generation opportunities
CREATE POLICY "Service role can insert document generation opportunities"
  ON document_generation_opportunities
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role policies for document generation requests
CREATE POLICY "Service role can insert document generation requests"
  ON document_generation_requests
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create a view for enriched conversation history
CREATE OR REPLACE VIEW conversation_history_enriched AS
SELECT 
    c.*,
    COUNT(cu.id) as total_utterances,
    COUNT(ctc.id) as total_tool_calls,
    EXISTS(SELECT 1 FROM conversation_transcripts ct WHERE ct.consultation_id = c.id) as has_full_transcript
FROM conversations c
LEFT JOIN conversation_utterances cu ON c.id = cu.conversation_id
LEFT JOIN conversation_tool_calls ctc ON c.id = ctc.conversation_id
GROUP BY c.id;

-- Grant access to the view
GRANT SELECT ON conversation_history_enriched TO authenticated;