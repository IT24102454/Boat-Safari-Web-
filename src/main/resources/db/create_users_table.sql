-- Create users table with correct schema for login system
-- SQL Server compatible syntax

-- Drop existing users table if it exists (be careful in production)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    DROP TABLE users;
    PRINT 'Dropped existing users table';
END

-- Create users table with correct column names
CREATE TABLE users (
    user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(255),
    second_name NVARCHAR(255),
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    contact_no NVARCHAR(255),
    address NVARCHAR(255),
    city NVARCHAR(255),
    street NVARCHAR(255),
    postal_code NVARCHAR(255),
    hire_date NVARCHAR(255),
    certification NVARCHAR(255),
    status NVARCHAR(50) DEFAULT 'AVAILABLE',
    role NVARCHAR(255) NOT NULL
);

PRINT 'Created users table with correct schema';

-- Insert test users with bcrypt hashed passwords
-- password123 = $2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.

-- Insert admin user
INSERT INTO users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, hire_date, certification, status, role)
VALUES ('Admin', 'User', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'admin@gmail.com', '987-654-3210', '456 Admin Ave', 'Admin City', 'Admin Street', '54321', '2023-01-01', 'System Administrator', 'AVAILABLE', 'ADMIN');

-- Insert test customer
INSERT INTO users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, status, role)
VALUES ('Test', 'Customer', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'test@gmail.com', '123-456-7890', '123 Test St', 'Test City', 'Test Street', '12345', 'AVAILABLE', 'CUSTOMER');

-- Insert safari guide
INSERT INTO users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, hire_date, certification, status, role)
VALUES ('Safari', 'Guide', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'guide@gmail.com', '555-123-4567', '789 Safari Road', 'Safari City', 'Safari Street', '98765', '2023-01-15', 'Certified Marine Guide', 'AVAILABLE', 'SAFARI_GUIDE');

PRINT 'Inserted test users with email/password: admin@gmail.com/password123, test@gmail.com/password123, guide@gmail.com/password123';