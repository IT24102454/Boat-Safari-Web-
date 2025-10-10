-- Add status column to users table for staff availability tracking
-- This script adds status tracking for all user types, particularly staff members

-- Add status column to users table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE users ADD status NVARCHAR(50) DEFAULT 'AVAILABLE'
    PRINT 'Added status column to users table'
END
ELSE
BEGIN
    PRINT 'Status column already exists in users table'
END

-- Update existing users to have default status
UPDATE users SET status = 'AVAILABLE' WHERE status IS NULL

-- Add status column to trips table if it doesn't exist  
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE trips ADD status NVARCHAR(50) DEFAULT 'ACTIVE'
    PRINT 'Added status column to trips table'
END
ELSE
BEGIN
    PRINT 'Status column already exists in trips table'
END

-- Update existing trips to have default status
UPDATE trips SET status = 'ACTIVE' WHERE status IS NULL

PRINT 'Status columns update completed successfully'