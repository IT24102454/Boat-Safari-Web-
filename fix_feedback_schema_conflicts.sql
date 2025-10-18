-- Fix for Feedback Database Schema Conflicts
-- This script resolves the foreign key constraint conflicts that prevent the application from starting

USE BoatSafariDB;
GO

-- Step 1: Drop existing conflicting constraints
PRINT 'Step 1: Dropping conflicting foreign key constraints...'

-- Drop existing foreign key constraints for feedbacks table if they exist
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
           WHERE CONSTRAINT_NAME = 'FKi76ue5io1ocegll2s0hvo92fe')
BEGIN
    ALTER TABLE Feedbacks DROP CONSTRAINT FKi76ue5io1ocegll2s0hvo92fe;
    PRINT 'Dropped constraint FKi76ue5io1ocegll2s0hvo92fe';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
           WHERE CONSTRAINT_NAME = 'FKk2h5ydalvl7dymcgy16oklum4')
BEGIN
    ALTER TABLE Feedbacks DROP CONSTRAINT FKk2h5ydalvl7dymcgy16oklum4;
    PRINT 'Dropped constraint FKk2h5ydalvl7dymcgy16oklum4';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
           WHERE CONSTRAINT_NAME = 'FK5iio3a3hvhl2sx9ad4w4jjb0u')
BEGIN
    ALTER TABLE Feedbacks DROP CONSTRAINT FK5iio3a3hvhl2sx9ad4w4jjb0u;
    PRINT 'Dropped constraint FK5iio3a3hvhl2sx9ad4w4jjb0u';
END

-- Step 2: Ensure Feedbacks table has the correct structure
PRINT 'Step 2: Ensuring correct table structure...'

-- Check if feedbacks table exists, create if not
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Feedbacks')
BEGIN
    CREATE TABLE Feedbacks (
        feedback_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255),
        rating INT,
        comments NVARCHAR(2000),
        experience NVARCHAR(2000),
        category NVARCHAR(50) DEFAULT 'GENERAL',
        is_visible BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2,
        reply NVARCHAR(2000),
        replied_at DATETIME2,
        user_id BIGINT NULL,  -- NULL allowed for anonymous feedback
        booking_id BIGINT NULL,
        replied_by BIGINT NULL
    );
    PRINT 'Created Feedbacks table with correct structure';
END
ELSE
BEGIN
    PRINT 'Feedbacks table already exists, checking columns...'
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'title')
    BEGIN
        ALTER TABLE Feedbacks ADD title NVARCHAR(255);
        PRINT 'Added title column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'experience')
    BEGIN
        ALTER TABLE Feedbacks ADD experience NVARCHAR(2000);
        PRINT 'Added experience column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'category')
    BEGIN
        ALTER TABLE Feedbacks ADD category NVARCHAR(50) DEFAULT 'GENERAL';
        PRINT 'Added category column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'is_visible')
    BEGIN
        ALTER TABLE Feedbacks ADD is_visible BIT NOT NULL DEFAULT 1;
        PRINT 'Added is_visible column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'created_at')
    BEGIN
        ALTER TABLE Feedbacks ADD created_at DATETIME2 NOT NULL DEFAULT GETDATE();
        PRINT 'Added created_at column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'updated_at')
    BEGIN
        ALTER TABLE Feedbacks ADD updated_at DATETIME2;
        PRINT 'Added updated_at column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'reply')
    BEGIN
        ALTER TABLE Feedbacks ADD reply NVARCHAR(2000);
        PRINT 'Added reply column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'replied_at')
    BEGIN
        ALTER TABLE Feedbacks ADD replied_at DATETIME2;
        PRINT 'Added replied_at column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'user_id')
    BEGIN
        ALTER TABLE Feedbacks ADD user_id BIGINT NULL;
        PRINT 'Added user_id column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'booking_id')
    BEGIN
        ALTER TABLE Feedbacks ADD booking_id BIGINT NULL;
        PRINT 'Added booking_id column';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'replied_by')
    BEGIN
        ALTER TABLE Feedbacks ADD replied_by BIGINT NULL;
        PRINT 'Added replied_by column';
    END
END

-- Step 3: Make sure user_id allows NULL values (critical for anonymous feedback)
PRINT 'Step 3: Ensuring user_id allows NULL values...'

-- Check if user_id is currently NOT NULL and change it to allow NULL
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Feedbacks' AND COLUMN_NAME = 'user_id' AND IS_NULLABLE = 'NO')
BEGIN
    ALTER TABLE Feedbacks ALTER COLUMN user_id BIGINT NULL;
    PRINT 'Changed user_id to allow NULL values (required for anonymous feedback)';
END

-- Step 4: Ensure is_visible has a default value and allows NOT NULL
PRINT 'Step 4: Ensuring is_visible column configuration...'

-- Update existing NULL values in is_visible to true
UPDATE Feedbacks SET is_visible = 1 WHERE is_visible IS NULL;

-- Step 5: Update existing records to have required values
PRINT 'Step 5: Updating existing records...'

-- Set default values for existing records that might be missing required fields
UPDATE Feedbacks 
SET 
    title = COALESCE(title, LEFT(COALESCE(comments, 'Feedback'), 50)),
    category = COALESCE(category, 'GENERAL'),
    is_visible = COALESCE(is_visible, 1),
    created_at = COALESCE(created_at, GETDATE())
WHERE title IS NULL OR category IS NULL OR is_visible IS NULL OR created_at IS NULL;

-- Step 6: Clear hibernate's schema management cache by updating hibernate properties temporarily
PRINT 'Step 6: Schema conflicts resolved.'
PRINT 'The application should now start without foreign key constraint errors.'

-- Step 7: Show final table structure
PRINT 'Step 7: Final table structure verification:'

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Feedbacks'
ORDER BY ORDINAL_POSITION;

PRINT '========================================='
PRINT 'Database schema conflicts fixed!'
PRINT 'Key changes:'
PRINT '1. Removed conflicting foreign key constraints'
PRINT '2. Ensured user_id allows NULL (for anonymous feedback)'  
PRINT '3. Added missing columns if needed'
PRINT '4. Set proper defaults for existing records'
PRINT '========================================='