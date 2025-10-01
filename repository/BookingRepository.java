// src/main/java/com/boatsafari/managementsystem/repository/BookingRepository.java
package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTrip_TripId(Long tripId);
    // Existing methods... you can add more finder methods if needed
}