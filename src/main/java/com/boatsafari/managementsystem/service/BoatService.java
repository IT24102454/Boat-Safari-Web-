// src/main/java/com/boatsafari/managementsystem/service/BoatService.java
package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.Boat;
import com.boatsafari.managementsystem.repository.BoatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BoatService {

    @Autowired
    private BoatRepository boatRepository;

    public List<Boat> getAllBoats() {
        return boatRepository.findAll();
    }

    public Optional<Boat> getBoatById(Long id) {
        return boatRepository.findById(id);
    }

    /**
     * Get a boat by ID (returns Boat directly, not Optional)
     * @param id The ID of the boat
     * @return The Boat or null if not found
     */
    public Boat getBoatByIdDirect(Long id) {
        Optional<Boat> boatOpt = boatRepository.findById(id);
        return boatOpt.orElse(null);
    }

    /**
     * Update a boat
     * @param boat The boat to update
     * @return The updated boat
     */
    public Boat updateBoat(Boat boat) {
        return boatRepository.save(boat);
    }

    /**
     * Save a boat
     * @param boat The boat to save
     * @return The saved boat
     */
    public Boat saveBoat(Boat boat) {
        return boatRepository.save(boat);
    }
}