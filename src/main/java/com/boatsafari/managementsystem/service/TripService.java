// src/main/java/com/boatsafari/managementsystem/service/TripService.java
package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.Trip;
import com.boatsafari.managementsystem.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }

    /**
     * Get a trip by ID (returns Trip directly, not Optional)
     * @param id The ID of the trip
     * @return The Trip or null if not found
     */
    public Trip getTripByIdDirect(Long id) {
        Optional<Trip> tripOpt = tripRepository.findById(id);
        return tripOpt.orElse(null);
    }

    /**
     * Update a trip (without requiring ID parameter)
     * @param trip The trip to update
     * @return The updated trip
     */
    public Trip updateTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public Trip createTrip(Trip trip) {
        // Optional: guard against duplicates on same day/time/route
        return tripRepository.save(trip);
    }

    // Convenience creator with primitives (used by seeder)
    public Trip createTrip(LocalDate date, LocalTime start, LocalTime end, int capacity, double price, String route) {
        Trip t = new Trip();
        t.setDate(date);
        t.setStartTime(start);
        t.setEndTime(end);
        t.setCapacity(capacity);
        t.setPrice(price);
        t.setRoute(route);
        return tripRepository.save(t);
    }

    public Trip updateTrip(Long id, Trip tripDetails) {
        Optional<Trip> tripOptional = tripRepository.findById(id);
        if (tripOptional.isPresent()) {
            Trip existingTrip = tripOptional.get();
            existingTrip.setDate(tripDetails.getDate());
            existingTrip.setStartTime(tripDetails.getStartTime());
            existingTrip.setEndTime(tripDetails.getEndTime());
            existingTrip.setCapacity(tripDetails.getCapacity());
            existingTrip.setPrice(tripDetails.getPrice());
            existingTrip.setRoute(tripDetails.getRoute());
            existingTrip.setBoat(tripDetails.getBoat());
            existingTrip.setGuide(tripDetails.getGuide());
            return tripRepository.save(existingTrip);
        }
        return null;
    }

    public boolean deleteTrip(Long id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
            return true;
        }
        return false;
    }
}