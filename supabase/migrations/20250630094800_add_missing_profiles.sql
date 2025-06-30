/*
  # Fix for Missing Profiles Table
  
  This migration creates the missing `profiles` table that's required by the existing
  `on_auth_user_created` trigger. The error "relation public.profiles does not exist"
  occurs during user registration because the trigger tries to insert into this table.
*/

-- Create the missing profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,  -- Added full_name column required by the existing trigger
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (these are standard policies for profile data)
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
  
-- Note: We don't need to create the trigger since it already exists in the database
-- (as indicated by the error "trigger on_auth_user_created for relation users already exists")
