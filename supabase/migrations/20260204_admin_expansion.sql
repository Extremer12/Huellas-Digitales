-- Add is_banned column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_banned') THEN 
        ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT FALSE; 
    END IF; 
END $$;

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) NOT NULL,
    action TEXT NOT NULL,
    target_id UUID, -- Can reference user_id, animal_id, etc.
    target_table TEXT, -- 'profiles', 'animals', etc.
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies for admin_logs
-- Only admins can view logs
CREATE POLICY "Admins can view all logs" ON admin_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Only admins can insert logs (usually done via server-side or secure function, but for now allow client insert if admin)
CREATE POLICY "Admins can insert logs" ON admin_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
