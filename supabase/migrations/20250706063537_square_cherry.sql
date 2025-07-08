/*
  # Enhanced RLS Policies for New Features

  1. Roadmap Steps Policies
  2. User Goals Policies  
  3. Success Stories Policies
  4. Mock Interviews Policies
  5. Code Submissions Policies
  6. Resume Reviews Policies
  7. Badges Policies
  8. User Badges Policies
*/

-- =============================================
-- ROADMAP STEPS POLICIES
-- =============================================

CREATE POLICY "Everyone can read roadmap steps"
  ON roadmap_steps
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage roadmap steps"
  ON roadmap_steps
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- =============================================
-- USER GOALS POLICIES
-- =============================================

CREATE POLICY "Users can read own goals"
  ON user_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- SUCCESS STORIES POLICIES
-- =============================================

CREATE POLICY "Everyone can read approved success stories"
  ON success_stories
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Users can read own success stories"
  ON success_stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own success stories"
  ON success_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own success stories"
  ON success_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all success stories"
  ON success_stories
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- =============================================
-- MOCK INTERVIEWS POLICIES
-- =============================================

CREATE POLICY "Users can read own mock interviews"
  ON mock_interviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mock interviews"
  ON mock_interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mock interviews"
  ON mock_interviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- CODE SUBMISSIONS POLICIES
-- =============================================

CREATE POLICY "Users can read own code submissions"
  ON code_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own code submissions"
  ON code_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RESUME REVIEWS POLICIES
-- =============================================

CREATE POLICY "Users can read own resume reviews"
  ON resume_reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume reviews"
  ON resume_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- BADGES POLICIES
-- =============================================

CREATE POLICY "Everyone can read active badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage badges"
  ON badges
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- =============================================
-- USER BADGES POLICIES
-- =============================================

CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can read user badge counts"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (true);