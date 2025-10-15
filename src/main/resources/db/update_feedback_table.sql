-- Database migration script to update the Feedbacks table with new columns
-- This script should be run to add the new feedback management features

-- First, let's check the current structure and add new columns
-- Note: Adjust data types according to your database system (MySQL, PostgreSQL, etc.)

-- Add new columns to the Feedbacks table
ALTER TABLE Feedbacks 
ADD COLUMN title VARCHAR(255),
ADD COLUMN experience TEXT,
ADD COLUMN category VARCHAR(50) DEFAULT 'GENERAL',
ADD COLUMN isVisible BOOLEAN DEFAULT TRUE NOT NULL,
ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN updatedAt TIMESTAMP,
ADD COLUMN reply TEXT,
ADD COLUMN repliedAt TIMESTAMP,
ADD COLUMN userId BIGINT,
ADD COLUMN repliedBy BIGINT;

-- Update existing records to have default values
UPDATE Feedbacks 
SET 
    title = COALESCE(SUBSTR(comments, 1, 50), 'Feedback'),
    category = 'GENERAL',
    isVisible = TRUE,
    createdAt = CURRENT_TIMESTAMP
WHERE title IS NULL;

-- Add foreign key constraints
ALTER TABLE Feedbacks 
ADD CONSTRAINT FK_Feedbacks_User 
FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE;

ALTER TABLE Feedbacks 
ADD CONSTRAINT FK_Feedbacks_RepliedBy 
FOREIGN KEY (repliedBy) REFERENCES Users(userId) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IDX_Feedbacks_UserId ON Feedbacks(userId);
CREATE INDEX IDX_Feedbacks_Category ON Feedbacks(category);
CREATE INDEX IDX_Feedbacks_IsVisible ON Feedbacks(isVisible);
CREATE INDEX IDX_Feedbacks_CreatedAt ON Feedbacks(createdAt);
CREATE INDEX IDX_Feedbacks_RepliedBy ON Feedbacks(repliedBy);

-- Update comments column to allow longer text if needed
ALTER TABLE Feedbacks MODIFY COLUMN comments TEXT;

-- Make rating column nullable (since not all feedback needs ratings)
ALTER TABLE Feedbacks MODIFY COLUMN rating INT NULL;

-- Add check constraint for rating values
ALTER TABLE Feedbacks 
ADD CONSTRAINT CHK_Feedbacks_Rating 
CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Add check constraint for category values
ALTER TABLE Feedbacks 
ADD CONSTRAINT CHK_Feedbacks_Category 
CHECK (category IN ('GENERAL', 'SERVICE', 'BOOKING', 'WEBSITE', 'TRIP', 'STAFF'));

-- Create view for public feedbacks (only visible ones)
CREATE VIEW PublicFeedbacks AS
SELECT 
    f.feedbackId,
    f.title,
    f.rating,
    f.comments,
    f.experience,
    f.category,
    f.createdAt,
    f.reply,
    f.repliedAt,
    u.firstName,
    u.secondName,
    rb.firstName AS repliedByFirstName,
    rb.secondName AS repliedBySecondName
FROM Feedbacks f
LEFT JOIN Users u ON f.userId = u.userId
LEFT JOIN Users rb ON f.repliedBy = rb.userId
WHERE f.isVisible = TRUE
ORDER BY f.createdAt DESC;

-- Create view for IT Support dashboard
CREATE VIEW FeedbackManagement AS
SELECT 
    f.feedbackId,
    f.title,
    f.rating,
    f.comments,
    f.experience,
    f.category,
    f.isVisible,
    f.createdAt,
    f.updatedAt,
    f.reply,
    f.repliedAt,
    u.userId,
    u.firstName,
    u.secondName,
    u.email,
    rb.firstName AS repliedByFirstName,
    rb.secondName AS repliedBySecondName,
    b.bookingId,
    CASE 
        WHEN f.reply IS NOT NULL THEN 'REPLIED'
        ELSE 'PENDING'
    END AS status
FROM Feedbacks f
LEFT JOIN Users u ON f.userId = u.userId
LEFT JOIN Users rb ON f.repliedBy = rb.userId
LEFT JOIN Bookings b ON f.bookingId = b.bookingId
ORDER BY f.createdAt DESC;

-- Insert sample feedback categories into a reference table (optional)
CREATE TABLE IF NOT EXISTS FeedbackCategories (
    categoryId INT PRIMARY KEY AUTO_INCREMENT,
    categoryName VARCHAR(50) UNIQUE NOT NULL,
    categoryDescription TEXT,
    isActive BOOLEAN DEFAULT TRUE
);

INSERT INTO FeedbackCategories (categoryName, categoryDescription) VALUES
('GENERAL', 'General feedback about the service'),
('SERVICE', 'Feedback about customer service quality'),
('BOOKING', 'Feedback about the booking process'),
('WEBSITE', 'Feedback about website usability and features'),
('TRIP', 'Feedback about specific trip experiences'),
('STAFF', 'Feedback about staff performance and behavior');

-- Create a trigger to automatically set updatedAt timestamp
DELIMITER //
CREATE TRIGGER Feedbacks_UpdateTimestamp 
    BEFORE UPDATE ON Feedbacks
    FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Grant permissions (adjust according to your user roles)
-- GRANT SELECT ON PublicFeedbacks TO 'webapp_user'@'%';
-- GRANT SELECT, INSERT, UPDATE ON Feedbacks TO 'webapp_user'@'%';
-- GRANT ALL PRIVILEGES ON FeedbackManagement TO 'admin_user'@'%';

-- Create stored procedures for common operations (optional)
DELIMITER //
CREATE PROCEDURE GetFeedbackStats()
BEGIN
    SELECT 
        COUNT(*) as totalFeedbacks,
        COUNT(CASE WHEN isVisible = TRUE THEN 1 END) as visibleFeedbacks,
        COUNT(CASE WHEN reply IS NOT NULL THEN 1 END) as repliedFeedbacks,
        COUNT(CASE WHEN reply IS NULL THEN 1 END) as pendingReplies,
        AVG(CASE WHEN rating IS NOT NULL THEN rating END) as averageRating
    FROM Feedbacks;
END//

CREATE PROCEDURE GetFeedbacksByCategory(IN categoryName VARCHAR(50))
BEGIN
    SELECT * FROM PublicFeedbacks 
    WHERE category = categoryName
    ORDER BY createdAt DESC;
END//

CREATE PROCEDURE GetUserFeedbacks(IN userIdParam BIGINT)
BEGIN
    SELECT * FROM Feedbacks 
    WHERE userId = userIdParam
    ORDER BY createdAt DESC;
END//
DELIMITER ;

-- Add comments to the table for documentation
ALTER TABLE Feedbacks COMMENT = 'Enhanced feedback table with IT support management features';

-- Final verification query to check the updated structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Feedbacks' 
ORDER BY ORDINAL_POSITION;

-- Success message
SELECT 'Feedback table migration completed successfully!' as Migration_Status;