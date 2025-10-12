-- Database setup script for Gaeilge App
-- Run this script to create the database and all required tables

-- Create the database (run this as superuser)
-- CREATE DATABASE gaeilge_app;

-- Connect to the database
-- \c gaeilge_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notecards table
CREATE TABLE IF NOT EXISTS notecards (
    id SERIAL PRIMARY KEY,
    english_phrase VARCHAR(255),
    irish_phrase VARCHAR(255),
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Create notecard_categories junction table
CREATE TABLE IF NOT EXISTS notecard_categories (
    notecard_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (notecard_id, category_id),
    FOREIGN KEY (notecard_id) REFERENCES notecards(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger on users table
DROP TRIGGER IF EXISTS set_updated_at ON users;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample categories
INSERT INTO categories (name) VALUES 
    ('Basic Vocabulary'),
    ('Common Phrases'),
    ('Numbers'),
    ('Colors'),
    ('Family'),
    ('Food'),
    ('Animals'),
    ('Weather')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample notecards (these will need a user_id, so we'll add them after user creation)
-- Note: You'll need to create a user first, then update these with the correct user_id
INSERT INTO notecards (english_phrase, irish_phrase, user_id) VALUES 
    ('Hello', 'Dia dhuit', 1),
    ('Thank you', 'Go raibh maith agat', 1),
    ('Goodbye', 'Slán', 1),
    ('Please', 'Le do thoil', 1),
    ('Yes', 'Tá', 1),
    ('No', 'Níl', 1)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE gaeilge_app TO your_username;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
