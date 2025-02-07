-- ALTER TABLE old_table_name RENAME TO new_table_name;
ALTER TABLE notecard RENAME TO notecards;

-- remove unused color column // Ran 01-19-2025
ALTER TABLE notecards DROP COLUMN color; 
