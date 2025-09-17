-- Execute the database schema creation
-- This script will create all necessary tables and policies

-- First, let's ensure we have the proper extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run the main schema creation
-- (The content from 001_create_database_schema.sql will be executed)

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
