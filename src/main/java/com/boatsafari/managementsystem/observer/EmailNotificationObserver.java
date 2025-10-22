package com.boatsafari.managementsystem.observer;

import com.boatsafari.managementsystem.model.Booking;
import org.springframework.stereotype.Component;

/**
 * Concrete Observer for Email Notifications
 * This observer sends emails when booking events occur
 */
@Component
public class EmailNotificationObserver implements BookingObserver {
    
    @Override
    public void onBookingStatusChanged(Booking booking, String oldStatus, String newStatus) {
        System.out.println("=== EMAIL NOTIFICATION OBSERVER ===");
        System.out.println("Sending email for booking status change:");
        System.out.println("Booking ID: " + booking.getBookingId());
        System.out.println("Customer: " + booking.getName());
        System.out.println("Email: " + booking.getEmail());
        System.out.println("Status changed: " + oldStatus + " -> " + newStatus);
        
        switch (newStatus.toUpperCase()) {
            case "CONFIRMED":
                sendBookingConfirmationEmail(booking);
                break;
            case "CANCELLED":
                sendCancellationEmail(booking);
                break;
            case "COMPLETED":
                sendThankYouEmail(booking);
                break;
            default:
                sendStatusUpdateEmail(booking, newStatus);
        }
        System.out.println("Email sent successfully!\n");
    }
    
    @Override
    public void onBookingCreated(Booking booking) {
        System.out.println("=== EMAIL NOTIFICATION OBSERVER ===");
        System.out.println("Sending welcome email for new booking:");
        System.out.println("Booking ID: " + booking.getBookingId());
        System.out.println("Customer: " + booking.getName());
        System.out.println("Email: " + booking.getEmail());
        sendWelcomeEmail(booking);
        System.out.println("Welcome email sent!\n");
    }
    
    @Override
    public String getObserverName() {
        return "EmailNotificationObserver";
    }
    
    // Simulate email sending methods
    private void sendBookingConfirmationEmail(Booking booking) {
        // In real implementation, use JavaMailSender or email service
        System.out.println("📧 Sending confirmation email to: " + booking.getEmail());
        System.out.println("Subject: Booking Confirmed - Boat Safari Adventure!");
    }
    
    private void sendCancellationEmail(Booking booking) {
        System.out.println("📧 Sending cancellation email to: " + booking.getEmail());
        System.out.println("Subject: Booking Cancelled - Refund Processing");
    }
    
    private void sendThankYouEmail(Booking booking) {
        System.out.println("📧 Sending thank you email to: " + booking.getEmail());
        System.out.println("Subject: Thank You for Your Safari Adventure!");
    }
    
    private void sendStatusUpdateEmail(Booking booking, String newStatus) {
        System.out.println("📧 Sending status update email to: " + booking.getEmail());
        System.out.println("Subject: Booking Update - Status: " + newStatus);
    }
    
    private void sendWelcomeEmail(Booking booking) {
        System.out.println("📧 Sending welcome email to: " + booking.getEmail());
        System.out.println("Subject: Welcome! Your Safari Booking is Received");
    }
}