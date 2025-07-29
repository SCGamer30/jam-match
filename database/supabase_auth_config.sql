-- Supabase Auth Configuration for JamMatch
-- This file contains auth settings and configurations

-- Configure auth settings
-- Note: These settings are typically configured through the Supabase dashboard
-- but are documented here for reference

-- Auth configuration (to be applied via Supabase dashboard):
-- 1. Enable email confirmations for new signups
-- 2. Set site URL to your frontend URL (e.g., http://localhost:3000 for development)
-- 3. Configure redirect URLs for auth flows
-- 4. Set session timeout (default 1 hour is fine)
-- 5. Enable email change confirmations

-- Custom claims function for user roles (if needed in future)
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Get user role from users table if needed
  SELECT 'musician' INTO user_role; -- Default role for all users
  
  claims := event->'claims';
  
  -- Add custom claims
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  
  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Email templates (to be configured in Supabase dashboard):
-- 
-- 1. Confirmation Email Template:
-- Subject: Welcome to JamMatch - Confirm your email
-- Body:
-- <h2>Welcome to JamMatch!</h2>
-- <p>Thanks for signing up! We're excited to help you find your perfect band members.</p>
-- <p>Please confirm your email address by clicking the link below:</p>
-- <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
-- <p>If you didn't create an account with us, please ignore this email.</p>
-- <p>Happy jamming!<br>The JamMatch Team</p>
--
-- 2. Password Reset Email Template:
-- Subject: Reset your JamMatch password
-- Body:
-- <h2>Password Reset Request</h2>
-- <p>We received a request to reset your JamMatch password.</p>
-- <p>Click the link below to reset your password:</p>
-- <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
-- <p>If you didn't request this, please ignore this email.</p>
-- <p>Best regards,<br>The JamMatch Team</p>
--
-- 3. Email Change Confirmation Template:
-- Subject: Confirm your new email address
-- Body:
-- <h2>Email Change Confirmation</h2>
-- <p>Please confirm your new email address by clicking the link below:</p>
-- <p><a href="{{ .ConfirmationURL }}">Confirm new email</a></p>
-- <p>If you didn't request this change, please contact support.</p>
-- <p>Best regards,<br>The JamMatch Team</p>

-- Function to handle user creation and profile setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, primary_role, profile_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'primary_role', 'other'),
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();