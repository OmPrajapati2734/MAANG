/*
  # Comprehensive Features Migration
  
  1. New Tables
    - `system_design_boards` - Visual system design practice
    - `github_integrations` - GitHub/GitLab sync
    - `question_trends` - Company-wise question analytics
    - `file_uploads` - File storage for resumes/documents
    
  2. Enhanced Tables
    - Add file upload support to resources
    - Add trend data to questions
    - Enhanced resume reviews with file support
    
  3. Security
    - Enable RLS on all new tables
    - Create appropriate policies
*/

-- System Design Boards table
CREATE TABLE IF NOT EXISTS system_design_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  board_data jsonb DEFAULT '{}',
  question_type text DEFAULT 'custom',
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_template boolean DEFAULT false,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_design_boards ENABLE ROW LEVEL SECURITY;

-- GitHub Integrations table
CREATE TABLE IF NOT EXISTS github_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  github_username text NOT NULL,
  access_token text, -- encrypted
  repo_name text,
  sync_enabled boolean DEFAULT true,
  last_sync_at timestamptz,
  sync_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;

-- Question Trends table
CREATE TABLE IF NOT EXISTS question_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  round_type text,
  frequency_percentage integer DEFAULT 0,
  trend_data jsonb DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  UNIQUE(company, category, difficulty, round_type)
);

ALTER TABLE question_trends ENABLE ROW LEVEL SECURITY;

-- File Uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  upload_type text NOT NULL CHECK (upload_type IN ('resume', 'document', 'resource', 'portfolio')),
  metadata jsonb DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Add file support to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS file_id uuid REFERENCES file_uploads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS file_preview_url text,
ADD COLUMN IF NOT EXISTS is_user_generated boolean DEFAULT false;

-- Add trend data to questions
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS trend_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_asked_date date,
ADD COLUMN IF NOT EXISTS success_rate integer DEFAULT 0;

-- Enhanced resume reviews with file support
ALTER TABLE resume_reviews
ADD COLUMN IF NOT EXISTS file_id uuid REFERENCES file_uploads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS parsing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS extracted_text text;

-- Create triggers for updated_at columns
CREATE TRIGGER update_system_design_boards_updated_at
  BEFORE UPDATE ON system_design_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_integrations_updated_at
  BEFORE UPDATE ON github_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample question trends data
INSERT INTO question_trends (company, category, difficulty, round_type, frequency_percentage, trend_data) VALUES
  ('Amazon', 'dsa', 'medium', 'online', 75, '{"common_topics": ["Dynamic Programming", "Trees", "Graphs"], "avg_time_minutes": 45}'),
  ('Amazon', 'dsa', 'hard', 'onsite', 60, '{"common_topics": ["Advanced DP", "Complex Graphs"], "avg_time_minutes": 60}'),
  ('Google', 'dsa', 'medium', 'phone', 80, '{"common_topics": ["Arrays", "Strings", "Recursion"], "avg_time_minutes": 45}'),
  ('Google', 'dsa', 'hard', 'onsite', 70, '{"common_topics": ["Graph Algorithms", "Advanced Trees"], "avg_time_minutes": 60}'),
  ('Meta', 'system-design', 'hard', 'onsite', 90, '{"common_topics": ["Chat Systems", "Social Media", "Real-time"], "avg_time_minutes": 45}'),
  ('Apple', 'dsa', 'medium', 'onsite', 65, '{"common_topics": ["Trees", "Design Patterns"], "avg_time_minutes": 50}'),
  ('Netflix', 'system-design', 'hard', 'onsite', 85, '{"common_topics": ["Video Streaming", "CDN", "Microservices"], "avg_time_minutes": 45}')
ON CONFLICT (company, category, difficulty, round_type) DO NOTHING;

-- Insert sample system design templates
INSERT INTO system_design_boards (user_id, title, description, board_data, question_type, difficulty, is_template, is_public)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  'Design YouTube',
  'Design a video streaming platform like YouTube with upload, streaming, and recommendation features',
  '{"components": ["Load Balancer", "API Gateway", "Video Service", "Database", "CDN", "Recommendation Engine"], "connections": [], "notes": "Focus on video encoding, storage, and global distribution"}'::jsonb,
  'template',
  'hard',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles)
ON CONFLICT DO NOTHING;

INSERT INTO system_design_boards (user_id, title, description, board_data, question_type, difficulty, is_template, is_public)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  'Design Amazon Cart',
  'Design a shopping cart system with inventory management, pricing, and checkout',
  '{"components": ["Load Balancer", "Cart Service", "Inventory Service", "Payment Service", "Database", "Cache"], "connections": [], "notes": "Consider consistency, availability, and transaction handling"}'::jsonb,
  'template',
  'medium',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles)
ON CONFLICT DO NOTHING;

INSERT INTO system_design_boards (user_id, title, description, board_data, question_type, difficulty, is_template, is_public)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  'Design Scalable Chat App',
  'Design a real-time chat application supporting millions of users',
  '{"components": ["WebSocket Gateway", "Message Service", "User Service", "Database", "Message Queue", "Notification Service"], "connections": [], "notes": "Focus on real-time messaging, message delivery, and scalability"}'::jsonb,
  'template',
  'hard',
  true,
  true
WHERE EXISTS (SELECT 1 FROM profiles)
ON CONFLICT DO NOTHING;

-- RLS Policies for new tables

-- System Design Boards Policies
CREATE POLICY "Users can read own design boards"
  ON system_design_boards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true OR is_template = true);

CREATE POLICY "Users can insert own design boards"
  ON system_design_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own design boards"
  ON system_design_boards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own design boards"
  ON system_design_boards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- GitHub Integrations Policies
CREATE POLICY "Users can read own github integrations"
  ON github_integrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own github integrations"
  ON github_integrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Question Trends Policies
CREATE POLICY "Everyone can read question trends"
  ON question_trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage question trends"
  ON question_trends
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- File Uploads Policies
CREATE POLICY "Users can read own files"
  ON file_uploads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can upload own files"
  ON file_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON file_uploads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON file_uploads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);