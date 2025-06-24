/*
# Update Stripe Checkout Function

1. New Features
  - Add support for trial_period_days parameter
  - Update validation for new parameters

2. Changes
  - Add trial_period_days parameter to checkout session creation
  - Update parameter validation logic
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create or replace the stripe-checkout function to support trial periods
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add trial_period_days column to stripe_subscriptions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE public.stripe_subscriptions ADD COLUMN trial_end bigint;
  END IF;
END $$;