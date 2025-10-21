-- Check existing payment data
SELECT COUNT(*) as payment_count FROM Payments;
SELECT TOP 5 * FROM Payments;

-- Check existing booking data for reference
SELECT COUNT(*) as booking_count FROM bookings;
SELECT TOP 5 booking_id, customer_id, trip_id, booking_date FROM bookings;

-- Check existing customer data for reference
SELECT COUNT(*) as customer_count FROM customers;
SELECT TOP 5 customer_id, first_name, last_name FROM customers;