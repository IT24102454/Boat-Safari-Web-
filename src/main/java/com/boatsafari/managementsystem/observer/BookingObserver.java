package com.boatsafari.managementsystem.observer;

import com.boatsafari.managementsystem.model.Booking;

/**
 * Observer Pattern Implementation
 * This interface defines the observer that will be notified of booking changes
 */
public interface BookingObserver {
    
    /**
     * Called when a booking status changes
     * @param booking The booking that changed
     * @param oldStatus Previous status
     * @param newStatus New status
     */
    void onBookingStatusChanged(Booking booking, String oldStatus, String newStatus);
    
    /**
     * Called when a new booking is created
     * @param booking The newly created booking
     */
    void onBookingCreated(Booking booking);
    
    /**
     * Get observer name for logging purposes
     */
    String getObserverName();
}