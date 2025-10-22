package com.boatsafari.managementsystem.observer;

import com.boatsafari.managementsystem.model.Booking;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Concrete Observer for Audit Logging
 * This observer maintains an audit trail of all booking changes
 */
@Component
public class AuditLogObserver implements BookingObserver {
    
    private static final DateTimeFormatter TIMESTAMP_FORMAT = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Override
    public void onBookingStatusChanged(Booking booking, String oldStatus, String newStatus) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        
        System.out.println("=== AUDIT LOG OBSERVER ===");
        System.out.println("Logging booking status change:");
        
        String logEntry = String.format(
            "[%s] BOOKING_STATUS_CHANGED: BookingID=%d, CustomerEmail=%s, " +
            "OldStatus=%s, NewStatus=%s, TripID=%s",
            timestamp,
            booking.getBookingId(),
            booking.getEmail(),
            oldStatus,
            newStatus,
            booking.getTrip() != null ? booking.getTrip().getTripId() : "N/A"
        );
        
        // In real implementation, write to database audit table or log file
        writeAuditLog(logEntry);
        System.out.println("Audit log entry created!\n");
    }
    
    @Override
    public void onBookingCreated(Booking booking) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        
        System.out.println("=== AUDIT LOG OBSERVER ===");
        System.out.println("Logging new booking creation:");
        
        String logEntry = String.format(
            "[%s] BOOKING_CREATED: BookingID=%d, CustomerName=%s, CustomerEmail=%s, " +
            "Passengers=%d, Status=%s, TripID=%s",
            timestamp,
            booking.getBookingId(),
            booking.getName(),
            booking.getEmail(),
            booking.getPassengers(),
            booking.getStatus(),
            booking.getTrip() != null ? booking.getTrip().getTripId() : "N/A"
        );
        
        writeAuditLog(logEntry);
        System.out.println("Audit log entry created!\n");
    }
    
    @Override
    public String getObserverName() {
        return "AuditLogObserver";
    }
    
    private void writeAuditLog(String logEntry) {
        // In real implementation, this would write to:
        // 1. Database audit table
        // 2. Log file
        // 3. External logging service
        
        System.out.println("📝 AUDIT LOG ENTRY:");
        System.out.println(logEntry);
        System.out.println("✅ Logged to audit system");
    }
}