package com.boatsafari.managementsystem.observer;

import com.boatsafari.managementsystem.model.Booking;
import org.springframework.stereotype.Component;

/**
 * Concrete Observer for Inventory Management
 * This observer updates trip capacity and availability when bookings change
 */
@Component
public class InventoryObserver implements BookingObserver {
    
    @Override
    public void onBookingStatusChanged(Booking booking, String oldStatus, String newStatus) {
        System.out.println("=== INVENTORY OBSERVER ===");
        System.out.println("Updating inventory for booking status change:");
        System.out.println("Booking ID: " + booking.getBookingId());
        System.out.println("Trip: " + (booking.getTrip() != null ? booking.getTrip().getName() : "N/A"));
        System.out.println("Passengers: " + booking.getPassengers());
        System.out.println("Status changed: " + oldStatus + " -> " + newStatus);
        
        if ("CONFIRMED".equals(newStatus) && !"CONFIRMED".equals(oldStatus)) {
            // Booking confirmed - reduce available capacity
            updateTripCapacity(booking, -booking.getPassengers());
        } else if ("CANCELLED".equals(newStatus) && "CONFIRMED".equals(oldStatus)) {
            // Confirmed booking cancelled - restore capacity
            updateTripCapacity(booking, booking.getPassengers());
        }
        System.out.println("Inventory updated!\n");
    }
    
    @Override
    public void onBookingCreated(Booking booking) {
        System.out.println("=== INVENTORY OBSERVER ===");
        System.out.println("New booking created - checking inventory:");
        System.out.println("Booking ID: " + booking.getBookingId());
        System.out.println("Trip: " + (booking.getTrip() != null ? booking.getTrip().getName() : "N/A"));
        
        if ("PROVISIONAL".equals(booking.getStatus())) {
            // Hold capacity temporarily for provisional booking
            holdTripCapacity(booking);
        }
        System.out.println("Inventory check completed!\n");
    }
    
    @Override
    public String getObserverName() {
        return "InventoryObserver";
    }
    
    private void updateTripCapacity(Booking booking, int capacityChange) {
        if (booking.getTrip() != null) {
            // In real implementation, update the database
            System.out.println("🏢 Updating trip capacity:");
            System.out.println("Trip ID: " + booking.getTrip().getTripId());
            System.out.println("Capacity change: " + capacityChange);
            System.out.println("Available seats: " + calculateAvailableSeats(booking));
        }
    }
    
    private void holdTripCapacity(Booking booking) {
        if (booking.getTrip() != null) {
            System.out.println("⏳ Holding capacity for provisional booking:");
            System.out.println("Trip ID: " + booking.getTrip().getTripId());
            System.out.println("Passengers: " + booking.getPassengers());
            System.out.println("Hold expires at: " + booking.getHoldTimer());
        }
    }
    
    private int calculateAvailableSeats(Booking booking) {
        // In real implementation, calculate from database
        return booking.getTrip() != null ? booking.getTrip().getCapacity() - booking.getPassengers() : 0;
    }
}