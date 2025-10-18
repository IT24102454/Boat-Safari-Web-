-- SQL Server script to add IT Support and IT Assistant users
-- Password: password123 (hashed with bcrypt)
-- Hash: $2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.

-- Insert IT Support user
INSERT INTO users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, hire_date, certification, status, role)
VALUES ('IT', 'Support', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'itsupport@gmail.com', '555-IT-HELP', '123 IT Street', 'Tech City', 'Support Lane', '90210', '2023-01-01', 'IT Support Specialist', 'AVAILABLE', 'IT_SUPPORT');

-- Insert IT Assistant user  
INSERT INTO users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, hire_date, certification, status, role)
VALUES ('IT', 'Assistant', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'itassistant@gmail.com', '555-IT-ASST', '456 Tech Avenue', 'Tech City', 'Assistant Boulevard', '90211', '2023-01-01', 'IT Assistant', 'AVAILABLE', 'IT_ASSISTANT');

PRINT 'Added IT Support users:';
PRINT 'IT Support: itsupport@gmail.com / password123';
PRINT 'IT Assistant: itassistant@gmail.com / password123';