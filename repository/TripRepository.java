// src/main/java/com/boatsafari/managementsystem/repository/TripRepository.java
package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    // Find all past-dated trips
    List<Trip> findAllByDateBefore(LocalDate date);

    // Fast bulk update (alternative to saveAll)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Trip t set t.date = :today where t.date < :today")
    int bulkRollPastTripsToToday(LocalDate today);
}