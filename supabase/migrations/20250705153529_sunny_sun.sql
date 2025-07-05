/*
  # Initial Database Setup - Clean Start
  
  This migration creates a complete database schema from scratch with:
  1. Separate tables for users and admins
  2. All content management tables
  3. Progress tracking
  4. Proper RLS policies
  5. Helper functions for admin management
  
  No dependencies on existing functions or policies.
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CORE USER TABLES
-- =============================================

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extended user information)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admins table (completely separate from users)
CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'content_admin' CHECK (role IN ('super_admin', 'content_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- CONTENT MANAGEMENT TABLES
-- =============================================

-- Companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo text NOT NULL,
  color text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL CHECK (category IN ('dsa', 'system-design', 'behavioral', 'company-specific')),
  company text,
  options jsonb,
  correct_answer integer,
  explanation text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resources table
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('article', 'video', 'book', 'course')),
  url text,
  content text,
  company text,
  step_id text,
  tags text[] DEFAULT '{}',
  video_duration integer,
  is_user_generated boolean DEFAULT false,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quizzes table
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('dsa', 'system-design', 'behavioral', 'company-specific')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  time_limit integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz Questions junction table
CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, question_id),
  UNIQUE(quiz_id, order_index)
);

-- =============================================
-- PROGRESS TRACKING TABLES
-- =============================================

-- User Progress table
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company text NOT NULL,
  step_id text NOT NULL,
  completed boolean DEFAULT false,
  score integer,
  video_progress jsonb DEFAULT '{}',
  completed_resources text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company, step_id)
);

-- Quiz Attempts table
CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id text NOT NULL,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  answers jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ADMIN HELPER FUNCTIONS
-- =============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION check_is_admin(check_auth_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_id = check_auth_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a super admin
CREATE OR REPLACE FUNCTION check_is_super_admin(check_auth_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_id = check_auth_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email text, admin_role text DEFAULT 'content_admin')
RETURNS text AS $$
DECLARE
  user_record profiles%ROWTYPE;
  result_message text;
BEGIN
  -- Validate role
  IF admin_role NOT IN ('super_admin', 'content_admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be super_admin or content_admin';
  END IF;
  
  -- Find the user by email in profiles
  SELECT * INTO user_record FROM profiles WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN 'Error: User with email ' || user_email || ' not found in profiles table. Please sign up first.';
  END IF;
  
  -- Insert or update users table
  INSERT INTO users (auth_id, email, full_name)
  VALUES (user_record.id, user_record.email, user_record.full_name)
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  -- Insert or update admins table
  INSERT INTO admins (auth_id, email, full_name, role)
  VALUES (user_record.id, user_record.email, user_record.full_name, admin_role)
  ON CONFLICT (auth_id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = now();
    
  result_message := 'Success: User ' || user_email || ' has been granted ' || admin_role || ' privileges';
  RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Admins policies
CREATE POLICY "Admins can read all admin data"
  ON admins FOR SELECT
  TO authenticated
  USING (check_is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admins"
  ON admins FOR ALL
  TO authenticated
  USING (check_is_super_admin(auth.uid()));

-- Companies policies
CREATE POLICY "Everyone can read companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (check_is_admin(auth.uid()));

-- Questions policies
CREATE POLICY "Everyone can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (check_is_admin(auth.uid()));

-- Resources policies
CREATE POLICY "Everyone can read resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL
  TO authenticated
  USING (check_is_admin(auth.uid()));

CREATE POLICY "Users can create user-generated resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (is_user_generated = true);

-- Quizzes policies
CREATE POLICY "Everyone can read active quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (check_is_admin(auth.uid()));

-- Quiz questions policies
CREATE POLICY "Everyone can read quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (check_is_admin(auth.uid()));

-- User progress policies
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Quiz attempts policies
CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTH TRIGGER
-- =============================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();