package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.PassengerCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PassengerCheckInRepository extends JpaRepository<PassengerCheckIn, Long> {
    List<PassengerCheckIn> findByBooking_Trip_TripId(Long tripId);
    Optional<PassengerCheckIn> findByBookingBookingId(Long bookingId);

    @Query("SELECT COUNT(p) FROM PassengerCheckIn p WHERE p.booking.trip.tripId = ?1 AND p.checkedIn = true")
    long countCheckedInPassengersByTripId(Long tripId);
}
