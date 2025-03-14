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

-- Create Messages table for chat functionality
CREATE TABLE "Message" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender VARCHAR NOT NULL REFERENCES "User" (username),
  recipient VARCHAR NOT NULL REFERENCES "User" (username),
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX "message_sender_recipient_index" ON "Message" (sender, recipient);
CREATE INDEX "message_recipient_sender_index" ON "Message" (recipient, sender);
CREATE INDEX "message_timestamp_index" ON "Message" (timestamp DESC);

-- Create match table to track user matches
CREATE TABLE "Match" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1 VARCHAR NOT NULL REFERENCES "User" (username),
  user2 VARCHAR NOT NULL REFERENCES "User" (username),
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user1, user2)
);

-- Create index for match queries
CREATE INDEX "match_user1_index" ON "Match" (user1);
CREATE INDEX "match_user2_index" ON "Match" (user2);