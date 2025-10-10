-- Create a Safari Guide user account for testing
-- Using SQL Server compatible syntax with Spring Boot script format

-- Check if user exists and insert if not
INSERT INTO Users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, hire_date, certification, role)
SELECT 'Safari', 'Guide', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'guide@gmail.com', '123-456-7890', 'Safari Office', 'Mombasa', 'Marine Drive', '80100', '2023-01-15', 'Certified Marine Guide', 'SAFARI_GUIDE'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'guide@gmail.com');
