-- First, drop any existing email authorization functions and policies
DROP FUNCTION IF EXISTS auth.email_is_authorized(text);
DROP POLICY IF EXISTS "Allow all email signups" ON auth.users;

-- Create a new email authorization function that always returns true
CREATE OR REPLACE FUNCTION auth.email_is_authorized(email text)
RETURNS boolean AS $$
BEGIN
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update auth config to disable email restrictions
UPDATE auth.config 
SET email_confirm_required = FALSE,
    restrict_email_domains = FALSE
WHERE id = 1;

-- Create a permissive policy for user signups
CREATE POLICY "Allow all email signups" ON auth.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auth.email_is_authorized TO anon, authenticated;
GRANT ALL ON auth.users TO anon, authenticated;

-- Ensure the auth.users table has RLS enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically authorize all email domains
CREATE OR REPLACE FUNCTION auth.authorize_email_domain()
RETURNS trigger AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER authorize_email_domain_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.authorize_email_domain();