-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all email signups" ON auth.users;

-- Create a simple, permissive policy
CREATE POLICY "Allow all email signups"
ON auth.users
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Ensure email restrictions are disabled
UPDATE auth.config
SET restrict_email_domains = false,
    email_confirm_required = false
WHERE id = 1;

-- Grant necessary permissions
GRANT ALL ON auth.users TO authenticated, anon;