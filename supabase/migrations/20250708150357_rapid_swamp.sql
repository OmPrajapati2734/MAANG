/*
  # Fix User Profile System and Remove Admin Dependencies
  
  1. Fix handle_new_user function with immutable search_path
  2. Ensure proper profile creation on user signup
  3. Remove admin dependencies from core functionality
  4. Add proper foreign key constraints
  5. Create storage buckets for file uploads
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function with immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('uploads', 'uploads', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ensure all existing users have profiles
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Add user preferences to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS github_username text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS current_company text,
ADD COLUMN IF NOT EXISTS experience_level text CHECK (experience_level IN ('entry', 'mid', 'senior', 'staff', 'principal')),
ADD COLUMN IF NOT EXISTS target_companies text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- Create user_stats table for dashboard metrics
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  questions_solved integer DEFAULT 0,
  total_practice_time integer DEFAULT 0, -- in minutes
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats WHERE user_stats.user_id = profiles.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger for user_stats updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Remove admin dependencies from existing policies
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;

-- Create simplified policies without admin dependencies
CREATE POLICY "Everyone can read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can read resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix file_uploads table constraints
ALTER TABLE file_uploads 
DROP CONSTRAINT IF EXISTS file_uploads_user_id_fkey,
ADD CONSTRAINT file_uploads_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix resume_reviews table constraints  
ALTER TABLE resume_reviews
DROP CONSTRAINT IF EXISTS resume_reviews_user_id_fkey,
ADD CONSTRAINT resume_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix other tables that reference profiles
ALTER TABLE user_goals
DROP CONSTRAINT IF EXISTS user_goals_user_id_fkey,
ADD CONSTRAINT user_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_progress
DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey,
ADD CONSTRAINT user_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts
DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_fkey,
ADD CONSTRAINT quiz_attempts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE mock_interviews
DROP CONSTRAINT IF EXISTS mock_interviews_user_id_fkey,
ADD CONSTRAINT mock_interviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE code_submissions
DROP CONSTRAINT IF EXISTS code_submissions_user_id_fkey,
ADD CONSTRAINT code_submissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_badges
DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey,
ADD CONSTRAINT user_badges_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE system_design_boards
DROP CONSTRAINT IF EXISTS system_design_boards_user_id_fkey,
ADD CONSTRAINT system_design_boards_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE github_integrations
DROP CONSTRAINT IF EXISTS github_integrations_user_id_fkey,
ADD CONSTRAINT github_integrations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;