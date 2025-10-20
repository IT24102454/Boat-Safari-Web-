-- Insert sample feedback data for testing
-- First, let's get the IT Support user ID (assuming it exists)
DECLARE @itSupportUserId BIGINT;
DECLARE @customerUserId BIGINT;

SELECT @itSupportUserId = user_id FROM users WHERE email = 'itsupport@gmail.com';

-- Insert a customer user if not exists
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@gmail.com')
BEGIN
    INSERT INTO users (first_name, second_name, password, email, contact_no, address, city, street, postal_code, hire_date, certification, status, role)
    VALUES ('John', 'Customer', '$2a$10$gYCEDfFbidA.i/KzOxsWCOqmz7Kz.2WmUVJXkRgLy7oe8JNMQJ9V.', 'customer@gmail.com', '555-1234', '123 Customer St', 'Customer City', 'Customer Lane', '12345', '2023-01-01', NULL, 'ACTIVE', 'CUSTOMER');
END

SELECT @customerUserId = user_id FROM users WHERE email = 'customer@gmail.com';

-- Insert sample feedbacks
INSERT INTO Feedbacks (title, rating, comments, experience, category, is_visible, created_at, user_id) VALUES
('Excellent Safari Experience!', 5, 'Had an amazing time on the boat safari. The wildlife viewing was spectacular and the guide was very knowledgeable.', 'The trip exceeded all my expectations. We saw elephants, crocodiles, and various bird species. The boat was comfortable and the lunch provided was delicious.', 'TRIP', 1, DATEADD(day, -5, GETDATE()), @customerUserId),

('Booking System Issue', 3, 'The online booking system was a bit confusing and I had trouble selecting dates.', 'While the trip itself was good, the booking process needs improvement. Some dates were not showing as available even though they should have been.', 'WEBSITE', 1, DATEADD(day, -4, GETDATE()), @customerUserId),

('Outstanding Staff Service', 5, 'The staff was incredibly helpful and professional throughout our journey.', 'From the moment we arrived until we left, every staff member was courteous, knowledgeable, and went above and beyond to ensure we had a great experience.', 'STAFF', 1, DATEADD(day, -3, GETDATE()), @customerUserId),

('Boat Maintenance Needed', 2, 'The boat seemed to have some mechanical issues during our trip.', 'The engine was making strange noises and we had to stop twice during the safari. This affected the wildlife viewing experience as animals were scared away by the noise.', 'SERVICE', 1, DATEADD(day, -2, GETDATE()), @customerUserId),

('Great Value for Money', 4, 'Overall satisfied with the experience considering the price point.', 'The safari was well worth the cost. Good balance of wildlife viewing, comfort, and service. Only minor suggestion would be to provide more detailed information about what to expect.', 'GENERAL', 1, DATEADD(day, -1, GETDATE()), @customerUserId);

-- Add a reply to one of the feedbacks
UPDATE Feedbacks 
SET reply = 'Thank you for your feedback regarding the booking system. We are currently working on improving the user interface and will implement your suggestions in our next update. We appreciate your patience.',
    replied_at = DATEADD(hour, -2, GETDATE()),
    replied_by = @itSupportUserId
WHERE title = 'Booking System Issue';

-- Add another reply
UPDATE Feedbacks 
SET reply = 'We sincerely apologize for the mechanical issues with the boat. We have scheduled immediate maintenance and inspections for all our vessels. We would like to offer you a complimentary safari to make up for this experience. Please contact us at your convenience.',
    replied_at = DATEADD(hour, -1, GETDATE()),
    replied_by = @itSupportUserId  
WHERE title = 'Boat Maintenance Needed';

PRINT 'Sample feedback data inserted successfully!';