-- JamMatch Database Schema
-- This file contains the complete database schema for the JamMatch application

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