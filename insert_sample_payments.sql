-- Insert sample payment data
-- First, let's check if we have any bookings and customers to reference

-- If we have existing customers and bookings, insert payments
-- Otherwise, create minimal sample data

-- Create some sample customers if none exist
IF NOT EXISTS (SELECT 1 FROM customers)
BEGIN
    INSERT INTO customers (first_name, last_name, email, phone, password)
    VALUES 
    ('John', 'Doe', 'john.doe@email.com', '1234567890', 'password123'),
    ('Jane', 'Smith', 'jane.smith@email.com', '0987654321', 'password123'),
    ('Bob', 'Johnson', 'bob.johnson@email.com', '5555555555', 'password123'),
    ('Alice', 'Brown', 'alice.brown@email.com', '4444444444', 'password123'),
    ('Charlie', 'Wilson', 'charlie.wilson@email.com', '3333333333', 'password123');
END

-- Create some sample trips if none exist
IF NOT EXISTS (SELECT 1 FROM trips)
BEGIN
    INSERT INTO trips (trip_name, duration, price, date, capacity, status)
    VALUES 
    ('Island Adventure', 240, 150.00, DATEADD(day, 1, GETDATE()), 20, 'available'),
    ('Sunset Cruise', 180, 120.00, DATEADD(day, 2, GETDATE()), 15, 'available'),
    ('Dolphin Watching', 300, 200.00, DATEADD(day, 3, GETDATE()), 25, 'available'),
    ('Fishing Expedition', 360, 180.00, DATEADD(day, 4, GETDATE()), 12, 'available'),
    ('Beach Hopping', 480, 250.00, DATEADD(day, 5, GETDATE()), 18, 'available');
END

-- Create some sample bookings if none exist
IF NOT EXISTS (SELECT 1 FROM bookings)
BEGIN
    DECLARE @customer1 INT, @customer2 INT, @customer3 INT, @customer4 INT, @customer5 INT;
    DECLARE @trip1 INT, @trip2 INT, @trip3 INT, @trip4 INT, @trip5 INT;
    
    SELECT TOP 1 @customer1 = customer_id FROM customers ORDER BY customer_id;
    SELECT @customer2 = customer_id FROM customers WHERE customer_id > @customer1 ORDER BY customer_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @customer3 = customer_id FROM customers WHERE customer_id > @customer2 ORDER BY customer_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @customer4 = customer_id FROM customers WHERE customer_id > @customer3 ORDER BY customer_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @customer5 = customer_id FROM customers WHERE customer_id > @customer4 ORDER BY customer_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    
    SELECT TOP 1 @trip1 = trip_id FROM trips ORDER BY trip_id;
    SELECT @trip2 = trip_id FROM trips WHERE trip_id > @trip1 ORDER BY trip_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @trip3 = trip_id FROM trips WHERE trip_id > @trip2 ORDER BY trip_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @trip4 = trip_id FROM trips WHERE trip_id > @trip3 ORDER BY trip_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    SELECT @trip5 = trip_id FROM trips WHERE trip_id > @trip4 ORDER BY trip_id OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;
    
    INSERT INTO bookings (customer_id, trip_id, booking_date, status, participants, total_amount)
    VALUES 
    (@customer1, @trip1, DATEADD(day, -10, GETDATE()), 'confirmed', 2, 300.00),
    (@customer2, @trip2, DATEADD(day, -8, GETDATE()), 'confirmed', 1, 120.00),
    (@customer3, @trip3, DATEADD(day, -6, GETDATE()), 'confirmed', 3, 600.00),
    (@customer4, @trip4, DATEADD(day, -4, GETDATE()), 'confirmed', 2, 360.00),
    (@customer5, @trip5, DATEADD(day, -2, GETDATE()), 'confirmed', 1, 250.00),
    (@customer1, @trip3, DATEADD(day, -15, GETDATE()), 'completed', 2, 400.00),
    (@customer2, @trip1, DATEADD(day, -12, GETDATE()), 'completed', 1, 150.00),
    (@customer3, @trip5, DATEADD(day, -9, GETDATE()), 'completed', 4, 1000.00),
    (@customer4, @trip2, DATEADD(day, -7, GETDATE()), 'completed', 1, 120.00),
    (@customer5, @trip4, DATEADD(day, -5, GETDATE()), 'completed', 3, 540.00);
END

-- Now insert sample payment data
INSERT INTO Payments (amount, payment_method, status, payment_date, card_holder_name, card_number, card_expiry, card_cvv)
VALUES
-- Recent payments (last 30 days)
(300.00, 'Credit Card', 'completed', DATEADD(day, -1, GETDATE()), 'John Doe', '**** **** **** 1234', '12/25', '***'),
(120.00, 'PayPal', 'completed', DATEADD(day, -3, GETDATE()), 'Jane Smith', NULL, NULL, NULL),
(600.00, 'Credit Card', 'completed', DATEADD(day, -5, GETDATE()), 'Bob Johnson', '**** **** **** 5678', '03/26', '***'),
(360.00, 'Debit Card', 'completed', DATEADD(day, -7, GETDATE()), 'Alice Brown', '**** **** **** 9012', '08/25', '***'),
(250.00, 'Credit Card', 'completed', DATEADD(day, -9, GETDATE()), 'Charlie Wilson', '**** **** **** 3456', '11/24', '***'),

-- Earlier payments (last 90 days)
(400.00, 'Credit Card', 'completed', DATEADD(day, -15, GETDATE()), 'John Doe', '**** **** **** 1234', '12/25', '***'),
(150.00, 'PayPal', 'completed', DATEADD(day, -20, GETDATE()), 'Jane Smith', NULL, NULL, NULL),
(1000.00, 'Credit Card', 'completed', DATEADD(day, -25, GETDATE()), 'Bob Johnson', '**** **** **** 5678', '03/26', '***'),
(120.00, 'Debit Card', 'completed', DATEADD(day, -30, GETDATE()), 'Alice Brown', '**** **** **** 9012', '08/25', '***'),
(540.00, 'Credit Card', 'completed', DATEADD(day, -35, GETDATE()), 'Charlie Wilson', '**** **** **** 3456', '11/24', '***'),

-- Some failed/pending payments for variety
(180.00, 'Credit Card', 'failed', DATEADD(day, -2, GETDATE()), 'Mike Davis', '**** **** **** 7890', '06/25', '***'),
(220.00, 'PayPal', 'pending', DATEADD(day, -1, GETDATE()), 'Sarah Wilson', NULL, NULL, NULL),
(75.00, 'Debit Card', 'refunded', DATEADD(day, -10, GETDATE()), 'Tom Anderson', '**** **** **** 2468', '09/25', '***'),

-- More historical data for better statistics
(450.00, 'Credit Card', 'completed', DATEADD(day, -45, GETDATE()), 'Lisa Garcia', '**** **** **** 1357', '02/26', '***'),
(380.00, 'PayPal', 'completed', DATEADD(day, -50, GETDATE()), 'David Lee', NULL, NULL, NULL),
(290.00, 'Credit Card', 'completed', DATEADD(day, -55, GETDATE()), 'Emma Taylor', '**** **** **** 8024', '07/25', '***'),
(320.00, 'Debit Card', 'completed', DATEADD(day, -60, GETDATE()), 'James Miller', '**** **** **** 4680', '04/26', '***'),
(275.00, 'Credit Card', 'completed', DATEADD(day, -65, GETDATE()), 'Olivia Martinez', '**** **** **** 1593', '10/25', '***'),
(195.00, 'PayPal', 'completed', DATEADD(day, -70, GETDATE()), 'William Garcia', NULL, NULL, NULL),
(430.00, 'Credit Card', 'completed', DATEADD(day, -75, GETDATE()), 'Sophia Rodriguez', '**** **** **** 7531', '01/26', '***'),
(350.00, 'Debit Card', 'completed', DATEADD(day, -80, GETDATE()), 'Benjamin Lewis', '**** **** **** 9642', '05/25', '***');

-- Print summary of inserted data
SELECT 'Payment data inserted successfully!' as message;
SELECT COUNT(*) as total_payments FROM Payments;
SELECT status, COUNT(*) as count FROM Payments GROUP BY status;
SELECT payment_method, COUNT(*) as count FROM Payments GROUP BY payment_method;