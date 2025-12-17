-- Add storage_backend column to track where images are stored
ALTER TABLE media ADD COLUMN storage_backend text NOT NULL DEFAULT 'supabase';

-- Possible values: 'supabase' or 'cloudinary'
