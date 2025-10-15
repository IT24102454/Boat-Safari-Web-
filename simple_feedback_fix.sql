-- Simple Database Fix for Feedback System (No Table Drop)
-- This script only fixes the constraints without dropping existing tables

USE [your_database_name]; -- Replace with your actual database name

-- 1. Check current feedback table structure
PRINT 'Current feedback table structure:'
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'feedback')
BEGIN
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'feedback'
    ORDER BY ORDINAL_POSITION;
END
ELSE
BEGIN
    PRINT 'Feedback table does not exist yet - it will be created by Hibernate'
END

-- 2. If feedback table exists, fix the userId constraint
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'feedback')
BEGIN
    -- Check if userId column exists and needs to be fixed
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'user_id' AND IS_NULLABLE = 'NO')
    BEGIN
        PRINT 'Fixing userId column to allow NULL values...'
        
        -- Drop foreign key constraint if it exists
        DECLARE @constraint_name NVARCHAR(256)
        SELECT @constraint_name = CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME LIKE '%feedback%' AND CONSTRAINT_NAME LIKE '%user%'
        
        IF @constraint_name IS NOT NULL
        BEGIN
            PRINT 'Dropping foreign key constraint: ' + @constraint_name
            EXEC('ALTER TABLE feedback DROP CONSTRAINT ' + @constraint_name)
        END
        
        -- Alter the userId column to allow NULL
        ALTER TABLE feedback ALTER COLUMN user_id BIGINT NULL
        
        -- Re-add the foreign key constraint (allowing NULL values)
        IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users')
        BEGIN
            ALTER TABLE feedback ADD CONSTRAINT FK_feedback_user 
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        END
        
        PRINT 'Successfully updated user_id column to allow NULL values'
    END
    ELSE
    BEGIN
        PRINT 'user_id column already allows NULL values or does not exist'
    END
END

-- 3. Insert sample data if table is empty
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'feedback')
BEGIN
    IF NOT EXISTS (SELECT * FROM feedback)
    BEGIN
        PRINT 'Inserting sample feedback data...'
        
        INSERT INTO feedback (title, comments, category, rating, user_id, is_visible, created_at)
        VALUES 
            ('Amazing Boat Safari Experience', 'Had a wonderful time exploring the marine life. The guides were knowledgeable and friendly!', 'TRIP', 5, NULL, 1, GETDATE()),
            ('Great Service', 'The booking process was smooth and the staff was very helpful throughout our journey.', 'SERVICE', 4, NULL, 1, DATEADD(day, -1, GETDATE())),
            ('Excellent Staff', 'The crew members were professional and made our trip memorable. Highly recommend!', 'STAFF', 5, NULL, 1, DATEADD(day, -2, GETDATE())),
            ('Good Value for Money', 'Overall satisfied with the experience. The boat was comfortable and well-maintained.', 'GENERAL', 4, NULL, 1, DATEADD(day, -3, GETDATE())),
            ('Easy Booking Process', 'The online booking system worked perfectly. No issues at all!', 'BOOKING', 4, NULL, 1, DATEADD(day, -4, GETDATE()));
        
        PRINT 'Sample data inserted successfully'
    END
    ELSE
    BEGIN
        PRINT 'Feedback table already contains data'
    END
END

PRINT '======================================='
PRINT 'Database fix completed!'
PRINT '======================================='