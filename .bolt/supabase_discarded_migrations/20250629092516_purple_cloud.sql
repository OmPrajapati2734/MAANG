/*
  # Complete MAANG Prep Portal Schema

  This migration creates the complete database schema for the MAANG Prep Portal
  including all tables, functions, policies, and sample data.

  ## Tables Created:
  1. profiles - User profiles linked to auth.users
  2. admin_users - Admin user management
  3. companies - Company information for interview prep
  4. questions - Practice questions database
  5. quizzes - Quiz management
  6. quiz_questions - Junction table for quiz-question relationships
  7. resources - Learning resources and materials
  8. user_progress - User progress tracking
  9. quiz_attempts - Quiz attempt history

  ## Security:
  - Row Level Security enabled on all tables
  - Admin helper functions for permission checking
  - Proper policies for data access control
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Auth service can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Auth service can read profiles"
  ON profiles FOR SELECT TO anon USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ADMIN USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'content_admin' CHECK (role = ANY (ARRAY['super_admin'::text, 'content_admin'::text])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin helper functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text, admin_role text DEFAULT 'content_admin')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record profiles%ROWTYPE;
BEGIN
  -- Find user by email
  SELECT * INTO user_record FROM profiles WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Insert or update admin_users
  INSERT INTO admin_users (id, email, full_name, role)
  VALUES (user_record.id, user_record.email, user_record.full_name, admin_role)
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = admin_role,
    updated_at = now();
    
  RETURN 'Successfully made ' || user_email || ' an admin with role: ' || admin_role;
END;
$$;

-- Admin users policies
DROP POLICY IF EXISTS "Admins can read all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

CREATE POLICY "Admins can read all admin users"
  ON admin_users FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()));

-- Admin users trigger
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo text NOT NULL,
  color text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
DROP POLICY IF EXISTS "Everyone can read companies" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;

CREATE POLICY "Everyone can read companies"
  ON companies FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Companies trigger
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  category text NOT NULL CHECK (category = ANY (ARRAY['dsa'::text, 'system-design'::text, 'behavioral'::text, 'company-specific'::text])),
  company text,
  options jsonb,
  correct_answer integer,
  explanation text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
DROP POLICY IF EXISTS "Everyone can read questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;

CREATE POLICY "Everyone can read questions"
  ON questions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Questions trigger
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- QUIZZES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['dsa'::text, 'system-design'::text, 'behavioral'::text, 'company-specific'::text])),
  difficulty text NOT NULL CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  time_limit integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
DROP POLICY IF EXISTS "Everyone can read active quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;

CREATE POLICY "Everyone can read active quizzes"
  ON quizzes FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Quizzes trigger
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- QUIZ QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, question_id),
  UNIQUE(quiz_id, order_index)
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Quiz questions policies
DROP POLICY IF EXISTS "Everyone can read quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;

CREATE POLICY "Everyone can read quiz questions"
  ON quiz_questions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- =============================================
-- RESOURCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['article'::text, 'video'::text, 'book'::text, 'course'::text])),
  url text,
  content text,
  company text,
  step_id text,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Resources policies
DROP POLICY IF EXISTS "Everyone can read resources" ON resources;
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;

CREATE POLICY "Everyone can read resources"
  ON resources FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Resources trigger
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company text NOT NULL,
  step_id text NOT NULL,
  completed boolean DEFAULT false,
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company, step_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- User progress policies
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User progress trigger
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- QUIZ ATTEMPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id text NOT NULL,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  answers jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz attempts policies
DROP POLICY IF EXISTS "Users can read own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;

CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- HANDLE NEW USER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert default companies
INSERT INTO companies (name, logo, color, description) VALUES
  ('Meta', '🔵', 'from-blue-500 to-blue-600', 'Prepare for Meta (Facebook) interviews with focus on behavioral, system design, and coding challenges.'),
  ('Amazon', '🟠', 'from-orange-500 to-orange-600', 'Master Amazon''s leadership principles and technical interviews with comprehensive preparation.'),
  ('Apple', '🍎', 'from-gray-700 to-gray-800', 'Excel in Apple interviews with design thinking, technical depth, and innovation focus.'),
  ('Netflix', '🔴', 'from-red-500 to-red-600', 'Navigate Netflix''s culture-focused interviews and technical challenges effectively.'),
  ('Google', '🟢', 'from-green-500 to-green-600', 'Ace Google interviews with algorithmic thinking, system design, and Googleyness.')
ON CONFLICT (name) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (title, description, difficulty, category, company, options, correct_answer, explanation, tags) VALUES 
  (
    'Two Sum Problem',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'easy',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use a hash map to store the complement of each number and its index. For each number, check if its complement exists in the hash map.',
    ARRAY['array', 'hash-table', 'two-pointers']
  ),
  (
    'Design a Chat System',
    'Design a real-time chat application that can handle millions of users like WhatsApp or Slack.',
    'hard',
    'system-design',
    NULL,
    NULL,
    NULL,
    'Key components: WebSocket connections for real-time messaging, message queues for reliability, database sharding for scalability, CDN for media files.',
    ARRAY['system-design', 'websockets', 'scalability']
  ),
  (
    'Tell me about a time you disagreed with your manager',
    'Behavioral question to assess conflict resolution and communication skills.',
    'medium',
    'behavioral',
    'Amazon',
    '["Describe the situation and disagreement clearly", "Explain how you approached the conversation respectfully", "Share the outcome and what you learned", "Focus on the process rather than who was right"]'::jsonb,
    2,
    'Use the STAR method (Situation, Task, Action, Result) and focus on how you handled the disagreement professionally while maintaining a good working relationship.',
    ARRAY['behavioral', 'conflict-resolution', 'communication']
  ),
  (
    'Meta Specific: How would you improve Facebook News Feed?',
    'Product design question specific to Meta focusing on user engagement and content relevance.',
    'hard',
    'company-specific',
    'Meta',
    '["Analyze current user engagement metrics", "Implement better content filtering algorithms", "Add more personalization features", "Focus on reducing misinformation"]'::jsonb,
    1,
    'Start by understanding current pain points, then propose data-driven solutions that align with Meta''s goals of meaningful social interactions.',
    ARRAY['product-design', 'meta', 'algorithms']
  ),
  (
    'Binary Tree Maximum Path Sum',
    'Given a non-empty binary tree, find the maximum path sum.',
    'hard',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use DFS with a global maximum variable. For each node, calculate the maximum path sum that includes that node.',
    ARRAY['tree', 'dfs', 'recursion']
  )
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, description, type, url, company, step_id) VALUES 
  (
    'Meta System Design Interview Guide',
    'Comprehensive guide covering Meta''s system design interview process and expectations.',
    'article',
    'https://example.com/meta-system-design',
    'Meta',
    'meta-3'
  ),
  (
    'Amazon Leadership Principles Deep Dive',
    'Video series explaining Amazon''s 16 leadership principles with real examples.',
    'video',
    'https://example.com/amazon-leadership',
    'Amazon',
    'amazon-1'
  ),
  (
    'Cracking the Coding Interview',
    'Essential book for technical interview preparation covering algorithms and data structures.',
    'book',
    'https://example.com/ctci',
    NULL,
    NULL
  ),
  (
    'System Design Fundamentals',
    'Core concepts for designing scalable distributed systems.',
    'course',
    'https://example.com/system-design-fundamentals',
    NULL,
    NULL
  ),
  (
    'Behavioral Interview Mastery',
    'Complete guide to acing behavioral interviews with the STAR method.',
    'video',
    'https://example.com/behavioral-interviews',
    NULL,
    NULL
  )
ON CONFLICT DO NOTHING;

-- Ensure profiles exist for all auth users
DO $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    INSERT INTO profiles (id, email, full_name, created_at, updated_at)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', ''),
      user_record.created_at,
      user_record.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;