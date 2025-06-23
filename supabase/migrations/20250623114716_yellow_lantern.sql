/*
  # Create conversations table

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tavus_conversation_id` (text, nullable)
      - `title` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `duration_minutes` (integer)
      - `key_topics` (text array)
      - `insights_count` (integer)
      - `mentor_persona` (text)
      - `status` (text)
      - `sentiment_score` (float, nullable)
      - `has_transcript` (boolean)
      - `has_recording` (boolean)
      - `context_data` (jsonb)
      - `message_history` (jsonb)
  
  2. Security
    - Enable RLS on `conversations` table
    - Add policies for authenticated users to manage their own conversations
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tavus_conversation_id TEXT,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER DEFAULT 0,
  key_topics TEXT[] DEFAULT '{}',
  insights_count INTEGER DEFAULT 0,
  mentor_persona TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  sentiment_score FLOAT,
  has_transcript BOOLEAN DEFAULT false,
  has_recording BOOLEAN DEFAULT false,
  context_data JSONB DEFAULT '{}',
  message_history JSONB DEFAULT '[]'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tavus_id ON conversations(tavus_conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can select their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);