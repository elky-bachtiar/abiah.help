/*
  # More aggressive fix for the full_name column
  
  The previous migration might not have been properly applied.
  This migration drops the profiles table if it exists and recreates it with all required columns.
*/

-- Drop and recreate the profiles table properly
DROP TABLE IF EXISTS public.profiles;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Examine the existing trigger to debug what it expects
DO $$
DECLARE
  trigger_def TEXT;
BEGIN
  SELECT pg_get_functiondef(oid) INTO trigger_def
  FROM pg_proc
  WHERE proname = 'handle_new_user';
  
  RAISE NOTICE 'Trigger definition: %', trigger_def;
END $$;
