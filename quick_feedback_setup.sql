-- Check existing database structure and create feedback table if needed
USE BoatSafariDB;

-- Check if feedback table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'feedback')
BEGIN
    PRINT 'Creating feedback table...'
    
    CREATE TABLE feedback (
        feedback_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        comments NVARCHAR(2000) NOT NULL,
        experience NVARCHAR(2000) NULL,
        category NVARCHAR(50) NOT NULL DEFAULT 'GENERAL',
        rating INT NULL CHECK (rating >= 1 AND rating <= 5),
        user_id BIGINT NULL,
        booking_id BIGINT NULL,
        is_visible BIT NOT NULL DEFAULT 1,
        reply NVARCHAR(2000) NULL,
        reply_date DATETIME2 NULL,
        replied_by BIGINT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NULL
    );
    
    PRINT 'Feedback table created successfully'
    
    -- Add foreign key constraints if users table exists
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users')
    BEGIN
        ALTER TABLE feedback ADD CONSTRAINT FK_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id);
        ALTER TABLE feedback ADD CONSTRAINT FK_feedback_replied_by FOREIGN KEY (replied_by) REFERENCES users(user_id);
        PRINT 'Added foreign key constraints to users table'
    END
    
    -- Add sample data
    INSERT INTO feedback (title, comments, category, rating, user_id, is_visible, created_at)
    VALUES 
        ('Amazing Boat Safari Experience', 'Had a wonderful time exploring the marine life. The guides were knowledgeable and friendly!', 'TRIP', 5, NULL, 1, GETDATE()),
        ('Great Service', 'The booking process was smooth and the staff was very helpful throughout our journey.', 'SERVICE', 4, NULL, 1, DATEADD(day, -1, GETDATE())),
        ('Excellent Staff', 'The crew members were professional and made our trip memorable. Highly recommend!', 'STAFF', 5, NULL, 1, DATEADD(day, -2, GETDATE())),
        ('Good Value for Money', 'Overall satisfied with the experience. The boat was comfortable and well-maintained.', 'GENERAL', 4, NULL, 1, DATEADD(day, -3, GETDATE())),
        ('Easy Booking Process', 'The online booking system worked perfectly. No issues at all!', 'BOOKING', 4, NULL, 1, DATEADD(day, -4, GETDATE())),
        ('Fantastic Wildlife Viewing', 'Saw dolphins, sea turtles, and beautiful coral reefs. The guide explained everything perfectly.', 'TRIP', 5, NULL, 1, DATEADD(day, -5, GETDATE())),
        ('Professional Team', 'From booking to the actual trip, everything was handled professionally. Great communication!', 'SERVICE', 5, NULL, 1, DATEADD(day, -6, GETDATE())),
        ('Comfortable Boat', 'The boat was clean, safe, and comfortable. Had all necessary safety equipment on board.', 'GENERAL', 4, NULL, 1, DATEADD(day, -7, GETDATE()));
    
    PRINT 'Sample data inserted successfully'
END
ELSE
BEGIN
    PRINT 'Feedback table already exists'
    
    -- Check if table has the right structure
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'user_id' AND IS_NULLABLE = 'YES')
    BEGIN
        PRINT 'Updating user_id column to allow NULL values...'
        
        -- Drop constraints first if they exist
        DECLARE @sql NVARCHAR(MAX) = ''
        SELECT @sql = @sql + 'ALTER TABLE feedback DROP CONSTRAINT ' + CONSTRAINT_NAME + '; '
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
        WHERE CONSTRAINT_NAME IN (
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'user_id'
        )
        
        IF @sql <> ''
        BEGIN
            EXEC sp_executesql @sql
        END
        
        -- Update column to allow NULL
        ALTER TABLE feedback ALTER COLUMN user_id BIGINT NULL
        
        -- Re-add foreign key constraint
        IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users')
        BEGIN
            ALTER TABLE feedback ADD CONSTRAINT FK_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id);
        END
        
        PRINT 'user_id column updated to allow NULL values'
    END
    
    -- Add sample data if table is empty
    IF NOT EXISTS (SELECT * FROM feedback)
    BEGIN
        INSERT INTO feedback (title, comments, category, rating, user_id, is_visible, created_at)
        VALUES 
            ('Amazing Boat Safari Experience', 'Had a wonderful time exploring the marine life. The guides were knowledgeable and friendly!', 'TRIP', 5, NULL, 1, GETDATE()),
            ('Great Service', 'The booking process was smooth and the staff was very helpful throughout our journey.', 'SERVICE', 4, NULL, 1, DATEADD(day, -1, GETDATE())),
            ('Excellent Staff', 'The crew members were professional and made our trip memorable. Highly recommend!', 'STAFF', 5, NULL, 1, DATEADD(day, -2, GETDATE())),
            ('Good Value for Money', 'Overall satisfied with the experience. The boat was comfortable and well-maintained.', 'GENERAL', 4, NULL, 1, DATEADD(day, -3, GETDATE())),
            ('Easy Booking Process', 'The online booking system worked perfectly. No issues at all!', 'BOOKING', 4, NULL, 1, DATEADD(day, -4, GETDATE())),
            ('Fantastic Wildlife Viewing', 'Saw dolphins, sea turtles, and beautiful coral reefs. The guide explained everything perfectly.', 'TRIP', 5, NULL, 1, DATEADD(day, -5, GETDATE())),
            ('Professional Team', 'From booking to the actual trip, everything was handled professionally. Great communication!', 'SERVICE', 5, NULL, 1, DATEADD(day, -6, GETDATE())),
            ('Comfortable Boat', 'The boat was clean, safe, and comfortable. Had all necessary safety equipment on board.', 'GENERAL', 4, NULL, 1, DATEADD(day, -7, GETDATE()));
        
        PRINT 'Sample data inserted'
    END
END

-- Verify the data
SELECT 
    feedback_id,
    title,
    category,
    rating,
    is_visible,
    created_at
FROM feedback 
WHERE is_visible = 1
ORDER BY created_at DESC;

PRINT 'Database setup completed!'