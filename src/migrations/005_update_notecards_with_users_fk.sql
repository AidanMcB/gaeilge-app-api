-- Step 1: Add the user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notecards' AND column_name = 'user_id') THEN
        ALTER TABLE notecards ADD COLUMN user_id INTEGER;
    END IF;
END $$;

-- Step 2: Add the foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_notecards_user') THEN
        ALTER TABLE notecards
        ADD CONSTRAINT fk_notecards_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
