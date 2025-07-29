-- Migration 001: Initial JamMatch Database Schema
-- Run this migration to set up the complete database schema with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores musician profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    instruments TEXT[] DEFAULT '{}',
    genres TEXT[] DEFAULT '{}',
    experience TEXT CHECK (experience IN ('beginner', 'intermediate', 'advanced', 'professional')),
    location TEXT,
    avatar_url TEXT,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_experience ON users(experience);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);
CREATE INDEX idx_users_instruments ON users USING GIN(instruments);
CREATE INDEX idx_users_genres ON users USING GIN(genres);

-- Bands table - stores band formations and member relationships
CREATE TABLE bands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    member_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disbanded')),
    compatibility_data JSONB DEFAULT '{}',
    formation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT bands_member_count CHECK (array_length(member_ids, 1) >= 3 AND array_length(member_ids, 1) <= 4)
);

-- Create indexes for bands table
CREATE INDEX idx_bands_status ON bands(status);
CREATE INDEX idx_bands_formation_date ON bands(formation_date);
CREATE INDEX idx_bands_member_ids ON bands USING GIN(member_ids);

-- Messages table - stores chat messages for bands
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messages table
CREATE INDEX idx_messages_band_id ON messages(band_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_band_created ON messages(band_id, created_at);

-- Compatibility scores table - stores matching data between users
CREATE TABLE compatibility_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    algorithmic_score INTEGER NOT NULL CHECK (algorithmic_score >= 0 AND algorithmic_score <= 100),
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    final_score INTEGER NOT NULL CHECK (final_score >= 0 AND final_score <= 100),
    ai_reasoning TEXT,
    location_score INTEGER DEFAULT 0 CHECK (location_score >= 0 AND location_score <= 50),
    genre_score INTEGER DEFAULT 0 CHECK (genre_score >= 0 AND genre_score <= 30),
    experience_score INTEGER DEFAULT 0 CHECK (experience_score >= 0 AND experience_score <= 20),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT compatibility_scores_unique_pair UNIQUE(user1_id, user2_id),
    CONSTRAINT compatibility_scores_no_self_match CHECK (user1_id != user2_id),
    CONSTRAINT compatibility_scores_ordered_pair CHECK (user1_id < user2_id)
);

-- Create indexes for compatibility_scores table
CREATE INDEX idx_compatibility_scores_user1 ON compatibility_scores(user1_id);
CREATE INDEX idx_compatibility_scores_user2 ON compatibility_scores(user2_id);
CREATE INDEX idx_compatibility_scores_final_score ON compatibility_scores(final_score);
CREATE INDEX idx_compatibility_scores_calculated_at ON compatibility_scores(calculated_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bands_updated_at BEFORE UPDATE ON bands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate band member relationships
CREATE OR REPLACE FUNCTION validate_band_members()
RETURNS TRIGGER AS $$
BEGIN
    -- Check that all member_ids exist in users table
    IF NOT (SELECT bool_and(EXISTS(SELECT 1 FROM users WHERE id = unnest_id))
            FROM unnest(NEW.member_ids) AS unnest_id) THEN
        RAISE EXCEPTION 'All band members must exist in users table';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for band member validation
CREATE TRIGGER validate_band_members_trigger BEFORE INSERT OR UPDATE ON bands
    FOR EACH ROW EXECUTE FUNCTION validate_band_members();

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

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;