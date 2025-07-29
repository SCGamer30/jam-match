-- Database Schema Validation Script
-- Run this script to verify that the database schema is properly set up

-- Check if all tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'bands', 'messages', 'compatibility_scores')
ORDER BY table_name;

-- Check if all indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'bands', 'messages', 'compatibility_scores')
ORDER BY tablename, indexname;

-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'bands', 'messages', 'compatibility_scores');

-- Check if all RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'bands', 'messages', 'compatibility_scores')
ORDER BY tablename, policyname;

-- Check if all functions exist
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'update_updated_at_column',
        'validate_band_member_roles',
        'get_band_members',
        'handle_new_user',
        'handle_user_delete'
    )
ORDER BY routine_name;

-- Check if all triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND event_object_table IN ('users', 'bands')
ORDER BY event_object_table, trigger_name;

-- Test basic table constraints
-- This will show constraint information
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'bands', 'messages', 'compatibility_scores')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;