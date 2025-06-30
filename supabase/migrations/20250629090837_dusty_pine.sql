/*
  # Add Quiz and Company Management Tables

  1. New Tables
    - `companies` - Store company information
    - `quizzes` - Store quiz information
    - `quiz_questions` - Link quizzes to questions

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin management and user access
*/

-- Companies table
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

CREATE POLICY "Everyone can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Quizzes table
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

CREATE POLICY "Everyone can read active quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Quiz Questions junction table
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

CREATE POLICY "Everyone can read quiz questions"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default companies
INSERT INTO companies (name, logo, color, description) VALUES
  ('Meta', '🔵', 'from-blue-500 to-blue-600', 'Prepare for Meta (Facebook) interviews with focus on behavioral, system design, and coding challenges.'),
  ('Amazon', '🟠', 'from-orange-500 to-orange-600', 'Master Amazon''s leadership principles and technical interviews with comprehensive preparation.'),
  ('Apple', '🍎', 'from-gray-700 to-gray-800', 'Excel in Apple interviews with design thinking, technical depth, and innovation focus.'),
  ('Netflix', '🔴', 'from-red-500 to-red-600', 'Navigate Netflix''s culture-focused interviews and technical challenges effectively.'),
  ('Google', '🟢', 'from-green-500 to-green-600', 'Ace Google interviews with algorithmic thinking, system design, and Googleyness.')
ON CONFLICT (name) DO NOTHING;