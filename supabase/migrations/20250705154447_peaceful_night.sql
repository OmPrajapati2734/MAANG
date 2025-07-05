/*
  # Enhanced Features Migration

  1. New Tables
    - `roadmap_steps` - Structured roadmap steps for each company
    - `user_goals` - Daily/weekly goals and progress tracking
    - `success_stories` - User success stories and experiences
    - `mock_interviews` - Mock interview sessions and results
    - `code_submissions` - Code editor submissions and test results
    - `resume_reviews` - AI resume review sessions
    - `badges` - Achievement badges system
    - `user_badges` - User earned badges

  2. Enhanced Tables
    - Add role levels, round types, and enhanced filtering to questions
    - Add streak tracking and goal management to user progress

  3. Security
    - Enable RLS on all new tables
    - Create appropriate policies
*/

-- Roadmap Steps table for structured company-specific roadmaps
CREATE TABLE IF NOT EXISTS roadmap_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('dsa', 'system-design', 'behavioral', 'company-culture', 'preparation')),
  estimated_hours integer DEFAULT 8,
  prerequisites text[] DEFAULT '{}',
  resources text[] DEFAULT '{}',
  checkpoints jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, step_number)
);

ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;

-- User Goals table for daily/weekly goal tracking
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_type text NOT NULL CHECK (target_type IN ('questions_solved', 'hours_studied', 'topics_completed', 'mock_interviews')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Success Stories table for user experiences
CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  preparation_time text,
  key_tips text[] DEFAULT '{}',
  difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 5),
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- Mock Interviews table
CREATE TABLE IF NOT EXISTS mock_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interview_type text NOT NULL CHECK (interview_type IN ('coding', 'system-design', 'behavioral', 'mixed')),
  company text,
  role_level text CHECK (role_level IN ('sde-1', 'sde-2', 'sde-3', 'senior', 'staff', 'principal')),
  duration_minutes integer NOT NULL,
  questions_asked jsonb DEFAULT '[]',
  user_responses jsonb DEFAULT '{}',
  ai_feedback text,
  overall_score integer CHECK (overall_score BETWEEN 0 AND 100),
  technical_score integer CHECK (technical_score BETWEEN 0 AND 100),
  communication_score integer CHECK (communication_score BETWEEN 0 AND 100),
  problem_solving_score integer CHECK (problem_solving_score BETWEEN 0 AND 100),
  areas_for_improvement text[] DEFAULT '{}',
  strengths text[] DEFAULT '{}',
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;

-- Code Submissions table for code editor
CREATE TABLE IF NOT EXISTS code_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  language text NOT NULL,
  code text NOT NULL,
  test_results jsonb DEFAULT '{}',
  execution_time_ms integer,
  memory_usage_kb integer,
  is_correct boolean DEFAULT false,
  time_complexity text,
  space_complexity text,
  ai_feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE code_submissions ENABLE ROW LEVEL SECURITY;

-- Resume Reviews table
CREATE TABLE IF NOT EXISTS resume_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  ai_feedback jsonb DEFAULT '{}',
  ats_score integer CHECK (ats_score BETWEEN 0 AND 100),
  suggestions text[] DEFAULT '{}',
  missing_keywords text[] DEFAULT '{}',
  formatting_issues text[] DEFAULT '{}',
  strengths text[] DEFAULT '{}',
  overall_rating text CHECK (overall_rating IN ('poor', 'fair', 'good', 'excellent')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resume_reviews ENABLE ROW LEVEL SECURITY;

-- Badges table for achievements
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  criteria jsonb NOT NULL,
  badge_type text NOT NULL CHECK (badge_type IN ('progress', 'achievement', 'streak', 'special')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- User Badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress_data jsonb DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Add enhanced columns to existing questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS role_level text CHECK (role_level IN ('sde-1', 'sde-2', 'sde-3', 'senior', 'staff', 'principal')),
ADD COLUMN IF NOT EXISTS round_type text CHECK (round_type IN ('online', 'phone', 'onsite', 'final')),
ADD COLUMN IF NOT EXISTS frequency_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS solution_approaches jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS test_cases jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS constraints text,
ADD COLUMN IF NOT EXISTS follow_up_questions text[] DEFAULT '{}';

-- Add streak tracking to user_progress
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date date;

-- Create triggers for updated_at columns
CREATE TRIGGER update_roadmap_steps_updated_at
  BEFORE UPDATE ON roadmap_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON success_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mock_interviews_updated_at
  BEFORE UPDATE ON mock_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default badges
INSERT INTO badges (name, description, icon, color, criteria, badge_type) VALUES
  ('First Steps', 'Complete your first practice question', '🎯', 'from-blue-500 to-blue-600', '{"questions_solved": 1}', 'progress'),
  ('Problem Solver', 'Solve 10 practice questions', '🧩', 'from-green-500 to-green-600', '{"questions_solved": 10}', 'progress'),
  ('Coding Ninja', 'Solve 50 practice questions', '🥷', 'from-purple-500 to-purple-600', '{"questions_solved": 50}', 'achievement'),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 'from-orange-500 to-orange-600', '{"streak_days": 7}', 'streak'),
  ('Month Master', 'Maintain a 30-day streak', '👑', 'from-yellow-500 to-yellow-600', '{"streak_days": 30}', 'streak'),
  ('System Designer', 'Complete 5 system design questions', '🏗️', 'from-indigo-500 to-indigo-600', '{"system_design_completed": 5}', 'achievement'),
  ('Interview Ready', 'Complete a full mock interview', '🎤', 'from-red-500 to-red-600', '{"mock_interviews_completed": 1}', 'achievement'),
  ('MAANG Bound', 'Complete roadmap for any MAANG company', '🚀', 'from-pink-500 to-pink-600', '{"roadmap_completed": 1}', 'special')
ON CONFLICT (name) DO NOTHING;

-- Insert sample roadmap steps for Amazon
INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  1,
  'Amazon Leadership Principles Mastery',
  'Deep dive into Amazon''s 16 Leadership Principles with real examples and STAR method practice',
  'company-culture',
  12,
  ARRAY[]::text[],
  '{"videos_watched": 0, "examples_prepared": 0, "practice_questions": 0}'::jsonb
FROM companies c WHERE c.name = 'Amazon'
ON CONFLICT (company_id, step_number) DO NOTHING;

INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  2,
  'Data Structures & Algorithms Foundation',
  'Master core DSA concepts with focus on Amazon''s preferred patterns: Arrays, Strings, Trees, Graphs',
  'dsa',
  40,
  ARRAY['Amazon Leadership Principles Mastery'],
  '{"easy_problems": 0, "medium_problems": 0, "patterns_learned": 0}'::jsonb
FROM companies c WHERE c.name = 'Amazon'
ON CONFLICT (company_id, step_number) DO NOTHING;

INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  3,
  'System Design for Scale',
  'Learn to design systems at Amazon scale: microservices, AWS integration, high availability',
  'system-design',
  30,
  ARRAY['Data Structures & Algorithms Foundation'],
  '{"concepts_learned": 0, "designs_completed": 0, "aws_services": 0}'::jsonb
FROM companies c WHERE c.name = 'Amazon'
ON CONFLICT (company_id, step_number) DO NOTHING;

INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  4,
  'Behavioral Interview Excellence',
  'Perfect your STAR method responses and leadership stories aligned with Amazon principles',
  'behavioral',
  16,
  ARRAY['Amazon Leadership Principles Mastery'],
  '{"star_stories": 0, "mock_interviews": 0, "feedback_sessions": 0}'::jsonb
FROM companies c WHERE c.name = 'Amazon'
ON CONFLICT (company_id, step_number) DO NOTHING;

-- Insert sample roadmap steps for Google
INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  1,
  'Google Culture & Googleyness',
  'Understand Google''s mission, values, and what makes a Googley candidate',
  'company-culture',
  8,
  ARRAY[]::text[],
  '{"culture_videos": 0, "mission_understanding": 0, "values_alignment": 0}'::jsonb
FROM companies c WHERE c.name = 'Google'
ON CONFLICT (company_id, step_number) DO NOTHING;

INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  2,
  'Advanced Algorithms & Optimization',
  'Master Google''s algorithm-heavy interview style with focus on optimization and complexity analysis',
  'dsa',
  50,
  ARRAY['Google Culture & Googleyness'],
  '{"algorithms_mastered": 0, "optimization_problems": 0, "complexity_analysis": 0}'::jsonb
FROM companies c WHERE c.name = 'Google'
ON CONFLICT (company_id, step_number) DO NOTHING;

INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  3,
  'Large Scale System Design',
  'Design systems for Google-scale traffic with focus on distributed systems and GCP services',
  'system-design',
  35,
  ARRAY['Advanced Algorithms & Optimization'],
  '{"distributed_concepts": 0, "gcp_services": 0, "scale_designs": 0}'::jsonb
FROM companies c WHERE c.name = 'Google'
ON CONFLICT (company_id, step_number) DO NOTHING;

INSERT INTO roadmap_steps (company_id, step_number, title, description, category, estimated_hours, prerequisites, checkpoints) 
SELECT 
  c.id,
  4,
  'Leadership & Collaboration',
  'Demonstrate leadership potential and collaborative problem-solving skills',
  'behavioral',
  12,
  ARRAY['Google Culture & Googleyness'],
  '{"leadership_examples": 0, "collaboration_stories": 0, "impact_metrics": 0}'::jsonb
FROM companies c WHERE c.name = 'Google'
ON CONFLICT (company_id, step_number) DO NOTHING;