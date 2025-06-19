/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `type` (text)
      - `content` (jsonb)
      - `status` (text)
      - `progress_data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `documents` table
    - Add policy for authenticated users to read/write their own documents
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  content jsonb NOT NULL,
  status text NOT NULL DEFAULT 'generating',
  progress_data jsonb,
  file_path text,
  file_size integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create document_shares table for sharing documents
CREATE TABLE IF NOT EXISTS document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_email text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{"can_read": true, "can_edit": false, "can_download": false, "can_track_progress": true}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read shares they created"
  ON document_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can insert shares for their documents"
  ON document_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = shared_by AND
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_id AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares they created"
  ON document_shares
  FOR DELETE
  TO authenticated
  USING (auth.uid() = shared_by);

-- Create index for faster lookups
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_document_shares_shared_with_email ON document_shares(shared_with_email);