-- PostgreSQL database schema
-- Equivalent to the Prisma schema provided

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Location table
CREATE TABLE "Location" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  city VARCHAR,
  country VARCHAR
);

-- Create User table
CREATE TABLE "User" (
  username VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  firstname VARCHAR NOT NULL,
  lastname VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  sexual_preferences VARCHAR[] NOT NULL,
  gender VARCHAR,
  birth_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  biography TEXT,
  profile_picture VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  interests VARCHAR[] NOT NULL,
  location_id UUID UNIQUE REFERENCES "Location" (id),
  authorize_location BOOLEAN NOT NULL DEFAULT false,
  pictures VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[]
);

-- Create junction table for the self-relation (Views)
CREATE TABLE "_Views" (
  "A" VARCHAR NOT NULL REFERENCES "User" (username),
  "B" VARCHAR NOT NULL REFERENCES "User" (username),
  PRIMARY KEY ("A", "B")
);

-- Fix the _Like table
CREATE TABLE "_Like" (
  liker VARCHAR NOT NULL REFERENCES "User" (username),
  liked VARCHAR NOT NULL REFERENCES "User" (username),  -- Corrected column name from liked_username
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (liker, liked)
);

-- Create index for better query performance
CREATE INDEX "Views_A_index" ON "_Views" ("A");
CREATE INDEX "Views_B_index" ON "_Views" ("B");

-- Create trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Index to improve query performance
CREATE INDEX "Like_liker_index" ON "_Like" (liker);
CREATE INDEX "Like_liked_index" ON "_Like" (liked);

-- Create Match table before the function that references it
CREATE TABLE "Match" (
  user1 VARCHAR NOT NULL REFERENCES "User" (username),
  user2 VARCHAR NOT NULL REFERENCES "User" (username),
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user1, user2)
);

-- Function to create a like between two users
CREATE OR REPLACE FUNCTION create_like(liker_username VARCHAR, liked_username VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  already_exists BOOLEAN;
  is_match BOOLEAN DEFAULT FALSE;
BEGIN
  -- Check if the like already exists
  SELECT EXISTS (
    SELECT 1 FROM "_Like" 
    WHERE liker = liker_username AND liked = liked_username
  ) INTO already_exists;
  
  -- If the like already exists, return FALSE
  IF already_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Insert the new like
  INSERT INTO "_Like" (liker, liked, created_at)
  VALUES (liker_username, liked_username, NOW());
  
  -- Check if there's a match
  SELECT EXISTS (
    SELECT 1 FROM "Match" 
    WHERE (user1 = liker_username AND user2 = liked_username) OR 
          (user1 = liked_username AND user2 = liker_username)
  ) INTO is_match;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Index to optimize match searches
CREATE INDEX "Match_user1_index" ON "Match" (user1);
CREATE INDEX "Match_user2_index" ON "Match" (user2);

-- Function to detect matches and insert them into the Match table
CREATE OR REPLACE FUNCTION create_match()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "_Like" WHERE liker = NEW.liked AND liked = NEW.liker
  ) THEN
    INSERT INTO "Match" (user1, user2, matched_at)
    VALUES (LEAST(NEW.liker, NEW.liked), GREATEST(NEW.liker, NEW.liked), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after each insertion in the Like table
CREATE TRIGGER check_for_match
AFTER INSERT ON "_Like"
FOR EACH ROW
EXECUTE FUNCTION create_match();

ALTER TABLE "User" ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE "User" ADD COLUMN verification_token TEXT;

-- Add password reset columns to User table
ALTER TABLE "User" ADD COLUMN reset_password_token TEXT;
ALTER TABLE "User" ADD COLUMN reset_password_expires TIMESTAMP;