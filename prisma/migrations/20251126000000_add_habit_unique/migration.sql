-- Add unique constraint to Habit table (study_id, habit_name)
-- This migration handles existing duplicate data by keeping only one record per (study_id, habit_name) combination

-- Step 1: Remove duplicates, keeping the oldest record for each (study_id, habit_name)
-- Note: This query creates a temporary table with the IDs to keep
CREATE TEMPORARY TABLE IF NOT EXISTS habit_ids_to_keep AS
SELECT MIN(habit_pk) as habit_pk
FROM Habit
GROUP BY study_id, habit_name;

-- Step 2: Delete duplicates (keeping only the ones in the temporary table)
DELETE h1 FROM Habit h1
LEFT JOIN habit_ids_to_keep h2 ON h1.habit_pk = h2.habit_pk
WHERE h2.habit_pk IS NULL;

-- Step 3: Add unique constraint
ALTER TABLE `Habit` ADD UNIQUE INDEX `Habit_study_id_habit_name_key`(`study_id`, `habit_name`);

