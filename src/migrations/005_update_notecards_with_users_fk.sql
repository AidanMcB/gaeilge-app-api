-- Step 1: Add the user_id column (need to clear data in notecards table first)
ALTER TABLE notecards
ADD COLUMN user_id INTEGER NOT NULL;

-- Step 2: Add the foreign key constraint
ALTER TABLE notecards
ADD CONSTRAINT fk_notecards_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
