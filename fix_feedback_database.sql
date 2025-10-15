-- Comprehensive Database Fix for Feedback System
-- This script resolves all database constraint issues

USE [your_database_name]; -- Replace with your actual database name

-- 1. First, drop existing feedback table if it exists (to avoid conflicts)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'feedback')
BEGIN
    PRINT 'Dropping existing feedback table...'
    
    -- Drop foreign key constraints first
    DECLARE @sql NVARCHAR(MAX) = ''
    SELECT @sql = @sql + 'ALTER TABLE ' + TABLE_NAME + ' DROP CONSTRAINT ' + CONSTRAINT_NAME + '; '
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME IN (
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'feedback'
    )
    
    IF @sql <> ''
    BEGIN
        EXEC sp_executesql @sql
        PRINT 'Dropped foreign key constraints'
    END
    
    -- Drop the table
    DROP TABLE feedback
    PRINT 'Feedback table dropped successfully'
END

-- 2. Also check for 'Feedbacks' table (in case it was created with this name)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Feedbacks')
BEGIN
    PRINT 'Dropping existing Feedbacks table...'
    
    -- Drop foreign key constraints first
    DECLARE @sql2 NVARCHAR(MAX) = ''
    SELECT @sql2 = @sql2 + 'ALTER TABLE ' + TABLE_NAME + ' DROP CONSTRAINT ' + CONSTRAINT_NAME + '; '
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_NAME IN (
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'Feedbacks'
    )
    
    IF @sql2 <> ''
    BEGIN
        EXEC sp_executesql @sql2
        PRINT 'Dropped foreign key constraints from Feedbacks table'
    END
    
    -- Drop the table
    DROP TABLE Feedbacks
    PRINT 'Feedbacks table dropped successfully'
END

-- 3. Create the feedback table with correct structure
PRINT 'Creating new feedback table...'

CREATE TABLE feedback (
    feedback_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    comments NTEXT NOT NULL,
    experience NTEXT NULL,
    category NVARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    rating INT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id BIGINT NULL, -- Allow NULL for anonymous feedback
    booking_id BIGINT NULL,
    is_visible BIT NOT NULL DEFAULT 1,
    reply NTEXT NULL,
    reply_date DATETIME2 NULL,
    replied_by BIGINT NULL, -- User who replied (IT Support)
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL
);

-- 4. Create foreign key constraints
PRINT 'Adding foreign key constraints...'

-- Foreign key to users table (allow NULL)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users')
BEGIN
    ALTER TABLE feedback 
    ADD CONSTRAINT FK_feedback_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id);
    PRINT 'Added foreign key constraint to users table'
    
    -- Foreign key for replied_by
    ALTER TABLE feedback 
    ADD CONSTRAINT FK_feedback_replied_by 
    FOREIGN KEY (replied_by) REFERENCES users(user_id);
    PRINT 'Added foreign key constraint for replied_by to users table'
END

-- Foreign key to bookings table (allow NULL)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'bookings')
BEGIN
    ALTER TABLE feedback 
    ADD CONSTRAINT FK_feedback_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id);
    PRINT 'Added foreign key constraint to bookings table'
END

-- 5. Create indexes for better performance
PRINT 'Creating indexes...'

CREATE INDEX IX_feedback_category ON feedback(category);
CREATE INDEX IX_feedback_created_at ON feedback(created_at);
CREATE INDEX IX_feedback_user_id ON feedback(user_id);
CREATE INDEX IX_feedback_is_visible ON feedback(is_visible);

PRINT 'Indexes created successfully'

-- 6. Insert some sample data for testing
PRINT 'Inserting sample feedback data...'

INSERT INTO feedback (title, comments, category, rating, user_id, is_visible, created_at)
VALUES 
    ('Amazing Boat Safari Experience', 'Had a wonderful time exploring the marine life. The guides were knowledgeable and friendly!', 'TRIP', 5, NULL, 1, GETDATE()),
    ('Great Service', 'The booking process was smooth and the staff was very helpful throughout our journey.', 'SERVICE', 4, NULL, 1, DATEADD(day, -1, GETDATE())),
    ('Excellent Staff', 'The crew members were professional and made our trip memorable. Highly recommend!', 'STAFF', 5, NULL, 1, DATEADD(day, -2, GETDATE())),
    ('Good Value for Money', 'Overall satisfied with the experience. The boat was comfortable and well-maintained.', 'GENERAL', 4, NULL, 1, DATEADD(day, -3, GETDATE())),
    ('Easy Booking Process', 'The online booking system worked perfectly. No issues at all!', 'BOOKING', 4, NULL, 1, DATEADD(day, -4, GETDATE()));

PRINT 'Sample data inserted successfully'

-- 7. Verify the table structure
PRINT 'Verifying table structure...'

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'feedback'
ORDER BY ORDINAL_POSITION;

-- 8. Verify sample data
PRINT 'Verifying sample data...'

SELECT 
    feedback_id,
    title,
    category,
    rating,
    user_id,
    is_visible,
    created_at
FROM feedback 
ORDER BY created_at DESC;

PRINT '========================================='
PRINT 'Database setup completed successfully!'
PRINT 'The feedback table is now ready for use.'
PRINT '========================================='