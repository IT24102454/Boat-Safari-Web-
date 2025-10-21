-- SQL Server script to add sample feedback data for testing
-- This will help test the feedback management page

-- First, let's add the Feedbacks table if it doesn't exist (it should already exist from Hibernate)
-- Insert sample feedback data with different categories and statuses

-- Sample feedback 1: Trip feedback with rating
INSERT INTO Feedbacks (title, rating, comments, category, is_visible, created_at, user_id)
VALUES ('Amazing Safari Experience!', 5, 'The boat safari was incredible! The guide was very knowledgeable and we saw amazing wildlife. Highly recommend this experience to everyone.', 'TRIP', 1, DATEADD(day, -7, GETDATE()), (SELECT TOP 1 user_id FROM users WHERE role = 'CUSTOMER'));

-- Sample feedback 2: Service feedback with reply
INSERT INTO Feedbacks (title, rating, comments, category, is_visible, created_at, reply, replied_at, replied_by, user_id)
VALUES ('Great Customer Service', 4, 'The staff was very helpful during booking process. Quick responses and professional service.', 'SERVICE', 1, DATEADD(day, -5, GETDATE()), 'Thank you for your positive feedback! We are glad you had a great experience with our team.', DATEADD(day, -4, GETDATE()), (SELECT TOP 1 user_id FROM users WHERE role = 'IT_SUPPORT'), (SELECT TOP 1 user_id FROM users WHERE role = 'CUSTOMER'));

-- Sample feedback 3: Website feedback without rating
INSERT INTO Feedbacks (title, comments, category, is_visible, created_at, user_id)
VALUES ('Website Navigation Issue', 'The booking process on the website is a bit confusing. It took me a while to find the payment section.', 'WEBSITE', 1, DATEADD(day, -3, GETDATE()), (SELECT TOP 1 user_id FROM users WHERE role = 'CUSTOMER'));

-- Sample feedback 4: General feedback with low rating
INSERT INTO Feedbacks (title, rating, comments, category, is_visible, created_at, user_id)
VALUES ('Could be better', 2, 'The boat was a bit crowded and the tour felt rushed. Expected more time to enjoy the scenery.', 'GENERAL', 1, DATEADD(day, -2, GETDATE()), (SELECT TOP 1 user_id FROM users WHERE role = 'CUSTOMER'));

-- Sample feedback 5: Staff feedback with reply
INSERT INTO Feedbacks (title, rating, comments, category, is_visible, created_at, reply, replied_at, replied_by, user_id)
VALUES ('Excellent Guide', 5, 'Our guide John was fantastic! Very professional and entertaining. Made the whole experience memorable.', 'STAFF', 1, DATEADD(day, -1, GETDATE()), 'We are thrilled to hear about your excellent experience with John! Your feedback has been shared with our team.', GETDATE(), (SELECT TOP 1 user_id FROM users WHERE role = 'IT_SUPPORT'), (SELECT TOP 1 user_id FROM users WHERE role = 'CUSTOMER'));

-- Sample feedback 6: Hidden feedback (for testing visibility toggle)
INSERT INTO Feedbacks (title, rating, comments, category, is_visible, created_at, user_id)
VALUES ('Test Hidden Feedback', 1, 'This is a test feedback that should be hidden from public view but visible in admin panel.', 'GENERAL', 0, GETDATE(), (SELECT TOP 1 user_id FROM users WHERE role = 'CUSTOMER'));

-- Sample feedback 7: Anonymous feedback (no user_id)
INSERT INTO Feedbacks (title, rating, comments, category, is_visible, created_at, user_id)
VALUES ('Anonymous Feedback', 3, 'Decent experience overall. Some areas for improvement but generally satisfied.', 'GENERAL', 1, GETDATE(), NULL);

PRINT 'Sample feedback data inserted successfully!';
PRINT 'Total feedbacks: 7 (6 visible, 1 hidden)';
PRINT 'Feedbacks with replies: 2';
PRINT 'Pending replies: 5';