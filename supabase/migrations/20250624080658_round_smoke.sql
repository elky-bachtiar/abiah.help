/*
  # Add conversation transcripts and document generation tables

  1. New Tables
    - `conversation_transcripts`: Stores transcripts from Tavus conversations
      - Links conversations to consultations
      - Stores full conversation messages and metadata
    - `conversation_events`: Logs webhook events from Tavus
    - `document_generation_opportunities`: Tracks potential document generation needs
    - `generated_documents`: Stores AI-generated documents
    - `llm_tool_executions`: Logs LLM tool usage
    - `document_generation_requests`: Tracks document generation requests

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Conversation transcripts (links conversations to consultations)
CREATE TABLE IF NOT EXISTS conversation_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    conversation_id TEXT UNIQUE NOT NULL, -- Tavus conversation ID
    transcript JSONB NOT NULL, -- Full conversation messages
    metadata JSONB DEFAULT '{}', -- Message counts, duration, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation events log
CREATE TABLE IF NOT EXISTS conversation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'transcription_ready', 'conversation_ended', etc.
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document generation opportunities (detected from conversations)
CREATE TABLE IF NOT EXISTS document_generation_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    suggested_documents JSONB NOT NULL, -- Which docs were mentioned
    conversation_context TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'generated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated documents (extends existing documents concept)
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    conversation_transcript_id UUID REFERENCES conversation_transcripts(id),
    document_type TEXT NOT NULL CHECK (document_type IN ('pitch_deck', 'business_plan', 'market_analysis', 'consultation_summary')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    generated_by TEXT DEFAULT 'llm',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool execution logs
CREATE TABLE IF NOT EXISTS llm_tool_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    conversation_transcript_id UUID REFERENCES conversation_transcripts(id),
    tool_name TEXT NOT NULL,
    input_parameters JSONB NOT NULL,
    execution_result JSONB,
    success BOOLEAN NOT NULL,
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document generation requests
CREATE TABLE IF NOT EXISTS document_generation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    conversation_transcript_id UUID REFERENCES conversation_transcripts(id),
    requested_document_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    parameters JSONB NOT NULL,
    result_document_id UUID REFERENCES generated_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_consultation_id ON conversation_transcripts(consultation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_conversation_id ON conversation_transcripts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_events_conversation_id ON conversation_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_events_processed ON conversation_events(processed);
CREATE INDEX IF NOT EXISTS idx_generated_documents_consultation_id ON generated_documents(consultation_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_tool_executions_consultation_id ON llm_tool_executions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_generation_requests_consultation_id ON document_generation_requests(consultation_id);

-- Enable Row Level Security
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_generation_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_generation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_transcripts
CREATE POLICY "Users can view their own conversation transcripts"
  ON conversation_transcripts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_transcripts.consultation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create policies for conversation_events
CREATE POLICY "Users can view their own conversation events"
  ON conversation_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_transcripts
      JOIN conversations ON conversations.id = conversation_transcripts.consultation_id
      WHERE conversation_transcripts.conversation_id = conversation_events.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create policies for document_generation_opportunities
CREATE POLICY "Users can view their own document generation opportunities"
  ON document_generation_opportunities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = document_generation_opportunities.consultation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create policies for generated_documents
CREATE POLICY "Users can view their own generated documents"
  ON generated_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = generated_documents.consultation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create policies for llm_tool_executions
CREATE POLICY "Users can view their own tool executions"
  ON llm_tool_executions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = llm_tool_executions.consultation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create policies for document_generation_requests
CREATE POLICY "Users can view their own document generation requests"
  ON document_generation_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = document_generation_requests.consultation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create document generation requests"
  ON document_generation_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = document_generation_requests.consultation_id
      AND conversations.user_id = auth.uid()
    )
  );