-- Create PassengerCheckIn table for guide check-in functionality
-- Using SQL Server compatible syntax with Spring Boot script format

-- SQL Server compatible version of CREATE TABLE IF NOT EXISTS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'passenger_check_ins')
BEGIN
    CREATE TABLE passenger_check_ins (
        check_in_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        booking_id BIGINT NOT NULL,
        checked_in BIT NOT NULL DEFAULT 0,
        check_in_time DATETIME2,
        notes VARCHAR(500),
        checked_in_by BIGINT
    );
END;
