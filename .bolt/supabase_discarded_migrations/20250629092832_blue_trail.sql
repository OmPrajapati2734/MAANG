/*
  # Clean Schema Setup with Separate User and Admin Tables

  1. New Tables
    - `users` - Regular user accounts (separate from auth.users)
    - `admins` - Admin accounts (separate table)
    - `companies` - Company information for interview prep
    - `questions` - Practice questions
    - `quizzes` - Quiz collections
    - `quiz_questions` - Quiz-question relationships
    - `resources` - Learning materials
    - `user_progress` - User progress tracking
    - `quiz_attempts` - Quiz attempt records

  2. Security
    - Enable RLS on all tables
    - Proper policies for user data isolation
    - Admin-only access for management functions

  3. Features
    - Complete separation of user and admin accounts
    - Sample data for companies, questions, and resources
    - Auto-profile creation for new signups
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- USERS TABLE (Regular Users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Users trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ADMINS TABLE (Admin Users)
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'content_admin' CHECK (role = ANY (ARRAY['super_admin'::text, 'content_admin'::text])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin helper functions
CREATE OR REPLACE FUNCTION public.is_admin(user_auth_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_id = user_auth_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_auth_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE auth_id = user_auth_id AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text, admin_role text DEFAULT 'content_admin')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
  auth_record auth.users%ROWTYPE;
BEGIN
  -- Find user by email
  SELECT * INTO user_record FROM users WHERE email = user_email;
  
  IF NOT FOUND THEN
    -- Try to find in auth.users
    SELECT * INTO auth_record FROM auth.users WHERE email = user_email;
    IF NOT FOUND THEN
      RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Create user record if it doesn't exist
    INSERT INTO users (auth_id, email, full_name)
    VALUES (auth_record.id, auth_record.email, COALESCE(auth_record.raw_user_meta_data->>'full_name', ''))
    RETURNING * INTO user_record;
  END IF;
  
  -- Insert or update admins
  INSERT INTO admins (auth_id, email, full_name, role)
  VALUES (user_record.auth_id, user_record.email, user_record.full_name, admin_role)
  ON CONFLICT (auth_id) 
  DO UPDATE SET 
    role = admin_role,
    updated_at = now();
    
  RETURN 'Successfully made ' || user_email || ' an admin with role: ' || admin_role;
END;
$$;

-- Admins policies
CREATE POLICY "Admins can read all admin data"
  ON admins FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admins"
  ON admins FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()));

-- Admins trigger
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
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
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Everyone can read companies"
  ON companies FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON companies FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Companies trigger
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
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Everyone can read questions"
  ON questions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Questions trigger
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
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Everyone can read active quizzes"
  ON quizzes FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Quizzes trigger
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
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Everyone can read resources"
  ON resources FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Resources trigger
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = user_progress.user_id AND users.auth_id = auth.uid()));

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = user_progress.user_id AND users.auth_id = auth.uid()));

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = user_progress.user_id AND users.auth_id = auth.uid()));

-- User progress trigger
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- QUIZ ATTEMPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id text NOT NULL,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  answers jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz attempts policies
CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = quiz_attempts.user_id AND users.auth_id = auth.uid()));

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = quiz_attempts.user_id AND users.auth_id = auth.uid()));

-- =============================================
-- HANDLE NEW USER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
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
  ),
  (
    'Reverse a Linked List',
    'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    'easy',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use three pointers: prev, current, and next. Iterate through the list and reverse the links.',
    ARRAY['linked-list', 'pointers', 'iteration']
  ),
  (
    'Design URL Shortener',
    'Design a URL shortening service like bit.ly or tinyurl.com.',
    'medium',
    'system-design',
    NULL,
    NULL,
    NULL,
    'Key components: Base62 encoding, database design for URL mapping, caching layer, rate limiting, analytics.',
    ARRAY['system-design', 'encoding', 'caching']
  ),
  (
    'Why do you want to work at Google?',
    'Common interview question to assess motivation and company knowledge.',
    'easy',
    'behavioral',
    'Google',
    '["Research the company mission and values", "Connect your skills to their needs", "Show genuine enthusiasm", "Mention specific products or initiatives"]'::jsonb,
    1,
    'Research Google''s mission, recent projects, and culture. Connect your personal goals and values with what Google stands for.',
    ARRAY['behavioral', 'motivation', 'company-research']
  )
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, description, type, url, company, step_id) VALUES 
  (
    'Meta System Design Interview Guide',
    'Comprehensive guide covering Meta''s system design interview process and expectations.',
    'article',
    'https://engineering.fb.com/2022/01/13/web/how-facebook-encodes-your-videos/',
    'Meta',
    'meta-3'
  ),
  (
    'Amazon Leadership Principles Deep Dive',
    'Video series explaining Amazon''s 16 leadership principles with real examples.',
    'video',
    'https://www.amazon.jobs/en/principles',
    'Amazon',
    'amazon-1'
  ),
  (
    'Cracking the Coding Interview',
    'Essential book for technical interview preparation covering algorithms and data structures.',
    'book',
    'https://www.crackingthecodinginterview.com/',
    NULL,
    NULL
  ),
  (
    'System Design Primer',
    'Learn how to design large-scale systems. Prep for the system design interview.',
    'article',
    'https://github.com/donnemartin/system-design-primer',
    NULL,
    NULL
  ),
  (
    'LeetCode Practice Platform',
    'Platform with thousands of coding problems to practice for technical interviews.',
    'course',
    'https://leetcode.com/',
    NULL,
    NULL
  ),
  (
    'Google Interview Preparation',
    'Official Google guide for technical interview preparation.',
    'article',
    'https://careers.google.com/how-we-hire/interview/',
    'Google',
    'google-1'
  ),
  (
    'Apple Design Philosophy',
    'Understanding Apple''s approach to product design and user experience.',
    'article',
    NULL,
    'Apple',
    'apple-1',
    'Apple''s design philosophy centers around simplicity, functionality, and user experience. Key principles include:

1. **Simplicity**: Remove unnecessary elements and focus on what matters most
2. **Intuitive Design**: Products should be easy to use without instruction
3. **Attention to Detail**: Every element should be carefully considered
4. **Innovation**: Push boundaries while maintaining usability
5. **Ecosystem Integration**: Products work seamlessly together

When interviewing at Apple, demonstrate how you apply these principles in your work. Show examples of how you''ve simplified complex problems, created intuitive user experiences, and paid attention to the smallest details that make a big difference.'
  ),
  (
    'Netflix Culture Deck',
    'Deep dive into Netflix''s unique culture and values.',
    'article',
    'https://jobs.netflix.com/culture',
    'Netflix',
    'netflix-1'
  )
ON CONFLICT DO NOTHING;

-- Ensure users exist for all auth users
DO $$
DECLARE
  auth_record auth.users%ROWTYPE;
BEGIN
  FOR auth_record IN SELECT * FROM auth.users LOOP
    INSERT INTO users (auth_id, email, full_name, created_at, updated_at)
    VALUES (
      auth_record.id,
      auth_record.email,
      COALESCE(auth_record.raw_user_meta_data->>'full_name', ''),
      auth_record.created_at,
      auth_record.updated_at
    )
    ON CONFLICT (auth_id) DO NOTHING;
  END LOOP;
END $$;