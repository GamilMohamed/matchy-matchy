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

-- Table Like pour stocker les likes entre utilisateurs
CREATE TABLE "Like" (
  liker VARCHAR NOT NULL REFERENCES "User" (username),
  liked VARCHAR NOT NULL REFERENCES "User" (username),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (liker, liked)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX "Like_liker_index" ON "Like" (liker);
CREATE INDEX "Like_liked_index" ON "Like" (liked);

-- Fonction pour créer un like entre deux utilisateurs
CREATE OR REPLACE FUNCTION create_like(liker_username VARCHAR, liked_username VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  already_exists BOOLEAN;
  is_match BOOLEAN DEFAULT FALSE;
BEGIN
  -- Vérifier si le like existe déjà
  SELECT EXISTS (
    SELECT 1 FROM "Like" 
    WHERE liker = liker_username AND liked = liked_username
  ) INTO already_exists;
  
  -- Si le like existe déjà, retourner FALSE
  IF already_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Insérer le nouveau like
  INSERT INTO "Like" (liker, liked, created_at)
  VALUES (liker_username, liked_username, NOW());
  
  -- Vérifier s'il y a un match (le trigger create_match() va automatiquement créer un match si nécessaire)
  SELECT EXISTS (
    SELECT 1 FROM "Match" 
    WHERE (user1 = liker_username AND user2 = liked_username) OR 
          (user1 = liked_username AND user2 = liker_username)
  ) INTO is_match;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Table Match pour stocker les correspondances mutuelles
CREATE TABLE "Match" (
  user1 VARCHAR NOT NULL REFERENCES "User" (username),
  user2 VARCHAR NOT NULL REFERENCES "User" (username),
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user1, user2)
);

-- Index pour optimiser les recherches de matchs
CREATE INDEX "Match_user1_index" ON "Match" (user1);
CREATE INDEX "Match_user2_index" ON "Match" (user2);

-- Fonction pour détecter les matchs et les insérer dans la table Match
CREATE OR REPLACE FUNCTION create_match()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Like" WHERE liker = NEW.liked AND liked = NEW.liker
  ) THEN
    INSERT INTO "Match" (user1, user2, matched_at)
    VALUES (LEAST(NEW.liker, NEW.liked), GREATEST(NEW.liker, NEW.liked), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appeler la fonction après chaque insertion dans la table Like
CREATE TRIGGER check_for_match
AFTER INSERT ON "Like"
FOR EACH ROW
EXECUTE FUNCTION create_match();
