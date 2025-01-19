-- ALTER TABLE old_table_name RENAME TO new_table_name;
ALTER TABLE notecard RENAME TO notecards;

-- remove unused color column (TO DO ! in prod!!!)
ALTER TABLE notecards DROP COLUMN color; 
