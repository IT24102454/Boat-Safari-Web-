// src/main/java/com/boatsafari/managementsystem/repository/TripRepository.java
package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    // Find all past-dated trips
    List<Trip> findAllByDateBefore(LocalDate date);

    // Fast bulk update (alternative to saveAll)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Trip t set t.date = :today where t.date < :today")
    int bulkRollPastTripsToToday(LocalDate today);

    // Find trips assigned to a specific guide
    List<Trip> findByGuide_UserId(Long guideId);

    // Find upcoming trips for a guide (today or future)
    List<Trip> findByGuide_UserIdAndDateGreaterThanEqual(Long guideId, LocalDate date);

    // Find past trips for a guide (history)
    List<Trip> findByGuide_UserIdAndDateLessThan(Long guideId, LocalDate date);
}