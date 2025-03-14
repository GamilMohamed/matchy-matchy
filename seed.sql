-- Insert sample locations
-- Use uuid-ossp extension function
INSERT INTO "Location" (id, latitude, longitude, city, country)
VALUES 
  (uuid_generate_v4(), 48.8566, 2.3522, 'Paris', 'France'),
  (uuid_generate_v4(), 40.7128, -74.0060, 'New York', 'USA'),
  (uuid_generate_v4(), 51.5074, -0.1278, 'London', 'UK'),
  (uuid_generate_v4(), 35.6762, 139.6503, 'Tokyo', 'Japan');

-- Store location IDs for reference
CREATE TEMPORARY TABLE temp_locations AS
SELECT id, city FROM "Location";

-- Insert sample users
INSERT INTO "User" (
  username, 
  email, 
  firstname, 
  lastname, 
  password, 
  sexual_preferences, 
  interests, 
  gender, 
  birth_date,
  created_at,
  updated_at,
  profile_complete,
  authorize_location,
  pictures
) 
SELECT
  'user' || n,  -- username
  'user' || n || '@example.com',  -- email
  'First' || n,  -- firstname
  'Last' || n,  -- lastname
  'hashedpw' || n,  -- password
  ARRAY['preference' || (n % 3 + 1)],  -- sexual_preferences
  ARRAY['interest' || (n % 5 + 1), 'interest' || (n % 4 + 2)],  -- interests
  CASE WHEN n % 2 = 0 THEN 'male' ELSE 'female' END,  -- gender
  ('1990-01-01'::date + (n || ' years')::interval)::timestamp with time zone,  -- birth_date
  NOW(),  -- created_at
  NOW(),  -- updated_at
  false,  -- profile_complete
  true,  -- authorize_location
  '{}'  -- empty pictures array
FROM generate_series(1, 20) AS n;

-- Update location_id for users
UPDATE "User" u
SET location_id = (
  SELECT id FROM temp_locations
  ORDER BY RANDOM()
  LIMIT 1
)
WHERE location_id IS NULL;

-- Create some views between users
INSERT INTO "_Views" ("A", "B")
VALUES
  ('user1', 'user2'),
  ('user1', 'user3'),
  ('user2', 'user1'),
  ('user3', 'user5'),
  ('user4', 'user6'),
  ('user5', 'user7');

-- Create some likes
INSERT INTO "_Like" (liker, liked)
VALUES
  ('user1', 'user2'),
  ('user2', 'user1'),  -- This will create a match
  ('user3', 'user5'),
  ('user5', 'user3'),  -- This will create a match
  ('user4', 'user6'),
  ('user7', 'user1');

-- The matches should be created automatically by the trigger