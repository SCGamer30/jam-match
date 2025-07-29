# JamMatch Database Setup

This directory contains all the database schema files and configurations for the JamMatch application.

## Files Overview

- `migration_001_initial_schema.sql` - Complete initial database setup (run this first)
- `schema.sql` - Database schema only (tables, indexes, functions, triggers)
- `rls_policies.sql` - Row Level Security policies only
- `supabase_auth_config.sql` - Auth configuration and triggers

## Setup Instructions

### 1. Run the Initial Migration

Execute the main migration file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of migration_001_initial_schema.sql
-- into the Supabase SQL editor and run it
```

### 2. Configure Auth Settings

In your Supabase dashboard, configure the following auth settings:

1. **Authentication > Settings**:

   - Enable email confirmations
   - Set site URL to your frontend URL (e.g., `http://localhost:3000`)
   - Configure redirect URLs
   - Enable email change confirmations

2. **Authentication > Email Templates**:
   - Customize the email templates as documented in `supabase_auth_config.sql`

### 3. Apply Auth Configuration

Run the auth configuration script:

```sql
-- Copy and paste the contents of supabase_auth_config.sql
-- into the Supabase SQL editor and run it
```

## Database Schema

### Tables

1. **users** - Musician profiles

   - Stores user information, primary role, instruments, genres, experience level
   - Primary role must be: drummer, guitarist, bassist, singer, or other
   - Includes profile completion status
   - Indexed on email, location, experience, primary_role, instruments, genres

2. **bands** - Band formations

   - Stores exactly 4 band members: drummer, guitarist, bassist, singer
   - Each role must be filled by a user with the corresponding primary_role
   - Includes compatibility data and status
   - Validates role assignments and prevents duplicate members

3. **messages** - Chat messages

   - Real-time messaging between band members
   - Linked to bands and users with foreign keys
   - Indexed for efficient chat history retrieval

4. **compatibility_scores** - Matching data
   - Stores algorithmic and AI compatibility scores
   - Includes detailed scoring breakdown
   - Ensures unique user pairs and prevents self-matching

### Security

Row Level Security (RLS) is enabled on all tables with policies that ensure:

- Users can only view their own profile and profiles of compatible users
- Users can only access bands they are members of
- Users can only send/view messages in their bands
- System operations (matching, band formation) use service role

### Triggers and Functions

- **update_updated_at_column()** - Automatically updates timestamps
- **validate_band_member_roles()** - Ensures each band member has the correct primary_role
- **get_band_members()** - Helper function to get all band members as an array
- **handle_new_user()** - Creates user profile on auth signup
- **handle_user_delete()** - Cleans up user data on deletion

## Environment Variables

Make sure your application has these Supabase environment variables configured:

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Testing the Setup

After running the migration, you can test the setup by:

1. Creating a test user through your frontend registration
2. Checking that the user appears in the `users` table
3. Verifying that RLS policies prevent unauthorized access
4. Testing the auth triggers work correctly

## Maintenance

- Monitor query performance using the indexes
- Regularly check RLS policy effectiveness
- Update compatibility scoring logic as needed
- Consider partitioning messages table if it grows large
