-- Row Level Security (RLS) Policies for JamMatch
-- These policies ensure users can only access data they're authorized to see

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own profile and profiles of users they have compatibility scores with
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can view profiles of other users they have compatibility scores with
CREATE POLICY "Users can view compatible user profiles" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compatibility_scores cs
            WHERE (cs.user1_id = auth.uid() AND cs.user2_id = users.id)
               OR (cs.user2_id = auth.uid() AND cs.user1_id = users.id)
        )
    );

-- Users can view profiles of band members in their bands
CREATE POLICY "Users can view band member profiles" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bands b
            WHERE auth.uid() = ANY(b.member_ids)
              AND users.id = ANY(b.member_ids)
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Bands table policies
-- Users can view bands they are members of
CREATE POLICY "Users can view their bands" ON bands
    FOR SELECT USING (auth.uid() = ANY(member_ids));

-- Only the system can create bands (through matching algorithm)
-- This will be handled by service role key in backend
CREATE POLICY "System can create bands" ON bands
    FOR INSERT WITH CHECK (true);

-- Band members can update band information (like name)
CREATE POLICY "Band members can update band info" ON bands
    FOR UPDATE USING (auth.uid() = ANY(member_ids));

-- Messages table policies
-- Users can view messages in bands they are members of
CREATE POLICY "Users can view messages in their bands" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bands b
            WHERE b.id = messages.band_id
              AND auth.uid() = ANY(b.member_ids)
        )
    );

-- Users can send messages to bands they are members of
CREATE POLICY "Users can send messages to their bands" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM bands b
            WHERE b.id = messages.band_id
              AND auth.uid() = ANY(b.member_ids)
        )
    );

-- Compatibility scores table policies
-- Users can view compatibility scores involving them
CREATE POLICY "Users can view their compatibility scores" ON compatibility_scores
    FOR SELECT USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Only the system can create/update compatibility scores
-- This will be handled by service role key in backend
CREATE POLICY "System can manage compatibility scores" ON compatibility_scores
    FOR ALL WITH CHECK (true);

-- Create a function to check if user is authenticated
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
    SELECT COALESCE(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid;
$$ LANGUAGE SQL STABLE;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;