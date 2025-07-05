/*
  # Fix Admin Authentication System

  1. Functions
    - Drop and recreate admin helper functions
    - Add make_user_admin helper function
  2. Security
    - Ensure proper RLS policies
    - Grant necessary permissions
  3. Tables
    - Ensure admin_users table exists with proper structure
*/

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.make_user_admin(text, text);
DROP FUNCTION IF EXISTS public.make_user_admin(text);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);

-- Recreate admin helper functions
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

-- Ensure admin_users table has proper structure
DO $$
BEGIN
  -- Check if admin_users table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    CREATE TABLE admin_users (
      id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email text UNIQUE NOT NULL,
      full_name text,
      role text NOT NULL DEFAULT 'content_admin' CHECK (role = ANY (ARRAY['super_admin'::text, 'content_admin'::text])),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Recreate RLS policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Admins can read all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

CREATE POLICY "Admins can read all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()));

-- Ensure trigger exists
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION make_user_admin(text, text) TO authenticated;

-- Ensure profiles are created for existing users
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