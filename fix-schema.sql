-- Fix missing columns in users table
-- This is needed because the Drizzle migrations were not properly applied

-- Add role column if it doesn't exist
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'manager';

-- Add other security fields if they don't exist
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "is_locked" text NOT NULL DEFAULT 'false';

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "failed_login_attempts" text NOT NULL DEFAULT '0';

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "last_failed_login" text;

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "last_password_change" text NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "must_change_password" text NOT NULL DEFAULT 'false';

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP;