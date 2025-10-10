package com.boatsafari.managementsystem.dto;

/**
 * DTO for capacity statistics on the staff dashboard
 */
public class CapacityStatsDto {
    private int boatsAvailable;
    private int boatsTotal;
    private int guidesAvailable;
    private int guidesTotal;
    private int bookingsToday;
    private int bookingCapacity;
    private int tripsCompleted;
    private int tripsScheduled;

    // Default constructor
    public CapacityStatsDto() {}

    // Constructor with all fields
    public CapacityStatsDto(int boatsAvailable, int boatsTotal, int guidesAvailable, int guidesTotal,
                           int bookingsToday, int bookingCapacity, int tripsCompleted, int tripsScheduled) {
        this.boatsAvailable = boatsAvailable;
        this.boatsTotal = boatsTotal;
        this.guidesAvailable = guidesAvailable;
        this.guidesTotal = guidesTotal;
        this.bookingsToday = bookingsToday;
        this.bookingCapacity = bookingCapacity;
        this.tripsCompleted = tripsCompleted;
        this.tripsScheduled = tripsScheduled;
    }

    // Getters and Setters
    public int getBoatsAvailable() {
        return boatsAvailable;
    }

    public void setBoatsAvailable(int boatsAvailable) {
        this.boatsAvailable = boatsAvailable;
    }

    public int getBoatsTotal() {
        return boatsTotal;
    }

    public void setBoatsTotal(int boatsTotal) {
        this.boatsTotal = boatsTotal;
    }

    public int getGuidesAvailable() {
        return guidesAvailable;
    }

    public void setGuidesAvailable(int guidesAvailable) {
        this.guidesAvailable = guidesAvailable;
    }

    public int getGuidesTotal() {
        return guidesTotal;
    }

    public void setGuidesTotal(int guidesTotal) {
        this.guidesTotal = guidesTotal;
    }

    public int getBookingsToday() {
        return bookingsToday;
    }

    public void setBookingsToday(int bookingsToday) {
        this.bookingsToday = bookingsToday;
    }

    public int getBookingCapacity() {
        return bookingCapacity;
    }

    public void setBookingCapacity(int bookingCapacity) {
        this.bookingCapacity = bookingCapacity;
    }

    public int getTripsCompleted() {
        return tripsCompleted;
    }

    public void setTripsCompleted(int tripsCompleted) {
        this.tripsCompleted = tripsCompleted;
    }

    public int getTripsScheduled() {
        return tripsScheduled;
    }

    public void setTripsScheduled(int tripsScheduled) {
        this.tripsScheduled = tripsScheduled;
    }

    @Override
    public String toString() {
        return "CapacityStatsDto{" +
                "boatsAvailable=" + boatsAvailable +
                ", boatsTotal=" + boatsTotal +
                ", guidesAvailable=" + guidesAvailable +
                ", guidesTotal=" + guidesTotal +
                ", bookingsToday=" + bookingsToday +
                ", bookingCapacity=" + bookingCapacity +
                ", tripsCompleted=" + tripsCompleted +
                ", tripsScheduled=" + tripsScheduled +
                '}';
    }
}