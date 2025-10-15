-- Update or create feedback table to allow anonymous feedback (NULL userId)

-- Check if the feedback table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'feedback')
BEGIN
    PRINT 'Creating feedback table...'
    
    CREATE TABLE feedback (
        feedbackId BIGINT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255),
        rating INT,
        comments NVARCHAR(2000),
        experience NVARCHAR(2000),
        category NVARCHAR(50),
        isVisible BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2,
        reply NVARCHAR(2000),
        repliedAt DATETIME2,
        userId BIGINT NULL, -- Allow NULL for anonymous feedback
        bookingId BIGINT,
        repliedBy BIGINT,
        
        -- Foreign key constraints
        FOREIGN KEY (userId) REFERENCES users(user_id),
        FOREIGN KEY (bookingId) REFERENCES booking(booking_id),
        FOREIGN KEY (repliedBy) REFERENCES users(user_id)
    );
    
    PRINT 'Feedback table created successfully!'
END
ELSE
BEGIN
    PRINT 'Feedback table found. Checking current structure...'
    
    -- Check if userId column allows NULL
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'userId' AND IS_NULLABLE = 'NO')
    BEGIN
        PRINT 'userId column currently does NOT allow NULL values. Updating...'
        
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
        ALTER TABLE feedback ALTER COLUMN userId BIGINT NULL
        
        -- Re-add the foreign key constraint (allowing NULL values)
        ALTER TABLE feedback ADD CONSTRAINT FK_feedback_user 
        FOREIGN KEY (userId) REFERENCES users(user_id)
        
        PRINT 'Successfully updated userId column to allow NULL values'
    END
    ELSE
    BEGIN
        PRINT 'userId column already allows NULL values'
    END
END

-- Verify the table structure
PRINT 'Final table structure:'
SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'feedback'
ORDER BY ORDINAL_POSITION

PRINT 'Database schema update completed successfully!'