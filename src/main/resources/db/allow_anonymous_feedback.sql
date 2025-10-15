-- Script to allow anonymous feedback by making userId nullable
-- This script updates the Feedbacks table to allow NULL values for userId

-- Step 1: Drop the existing foreign key constraint if it exists
ALTER TABLE Feedbacks DROP CONSTRAINT IF EXISTS FK_Feedbacks_User;

-- Step 2: Modify the userId column to allow NULL values (for anonymous feedback)
ALTER TABLE Feedbacks ALTER COLUMN userId BIGINT NULL;

-- Step 3: Re-create the foreign key constraint with NULL support
ALTER TABLE Feedbacks 
ADD CONSTRAINT FK_Feedbacks_User 
FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL;

-- Verify the change
-- SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'userId';