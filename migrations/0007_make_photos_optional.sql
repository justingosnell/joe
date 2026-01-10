-- Make photoUrl and photoId optional for locations
ALTER TABLE locations
  ALTER COLUMN photo_url SET DEFAULT '',
  ALTER COLUMN photo_id SET DEFAULT '';

-- Update existing null values to empty strings
UPDATE locations SET photo_url = '' WHERE photo_url IS NULL;
UPDATE locations SET photo_id = '' WHERE photo_id IS NULL;
