-- Sample payment data for testing the payment history panel
-- First, let's insert some sample payments

INSERT INTO Payments (payment_method, payment_date, amount, status, card_holder_name) VALUES
('Card', '2025-10-15 14:30:00', 250.00, 'Completed', 'John Smith'),
('Card', '2025-10-16 10:15:00', 180.00, 'Completed', 'Jane Doe'),
('On Arrival', '2025-10-17 09:45:00', 320.00, 'Pending', NULL),
('Card', '2025-10-18 16:20:00', 450.00, 'Completed', 'Mike Johnson'),
('Card', '2025-10-19 11:30:00', 290.00, 'Failed', 'Sarah Wilson'),
('On Arrival', '2025-10-19 13:15:00', 380.00, 'Completed', NULL);

-- Update existing bookings to have payment references
-- Note: This assumes you have existing bookings and trips in your database
-- You may need to adjust the booking_id values based on your actual data

-- Update some bookings to reference the payments we just created
UPDATE bookings SET payment_id = 1 WHERE booking_id = 1;
UPDATE bookings SET payment_id = 2 WHERE booking_id = 2;  
UPDATE bookings SET payment_id = 3 WHERE booking_id = 3;
UPDATE bookings SET payment_id = 4 WHERE booking_id = 4;
UPDATE bookings SET payment_id = 5 WHERE booking_id = 5;
UPDATE bookings SET payment_id = 6 WHERE booking_id = 6;