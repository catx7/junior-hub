-- JuniorHub Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create the database if it doesn't exist (handled by POSTGRES_DB env var)
-- This is just for reference

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE juniorhub TO postgres;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'JuniorHub database initialized successfully at %', NOW();
END $$;
