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

    /**
     * Delete a boat by ID
     * @param id The ID of the boat to delete
     */
    public void deleteBoat(Long id) {
        boatRepository.deleteById(id);
    }

    /**
     * Check if a boat exists by ID
     * @param id The ID of the boat
     * @return true if boat exists, false otherwise
     */
    public boolean existsById(Long id) {
        return boatRepository.existsById(id);
    }

    /**
     * Get boats by status
     * @param status The status to filter by
     * @return List of boats with the given status
     */
    public List<Boat> getBoatsByStatus(String status) {
        return boatRepository.findAll().stream()
                .filter(boat -> status.equals(boat.getStatus()))
                .toList();
    }

    /**
     * Get available boats only
     * @return List of boats with AVAILABLE status
     */
    public List<Boat> getAvailableBoats() {
        return getBoatsByStatus("AVAILABLE");
    }

    /**
     * Get boats by type
     * @param type The boat type to filter by
     * @return List of boats with the given type
     */
    public List<Boat> getBoatsByType(String type) {
        return boatRepository.findAll().stream()
                .filter(boat -> type.equals(boat.getType()))
                .toList();
    }

    /**
     * Get boats with capacity greater than or equal to specified value
     * @param minCapacity The minimum capacity
     * @return List of boats with capacity >= minCapacity
     */
    public List<Boat> getBoatsByMinCapacity(Integer minCapacity) {
        return boatRepository.findAll().stream()
                .filter(boat -> boat.getCapacity() != null && boat.getCapacity() >= minCapacity)
                .toList();
    }

    /**
     * Search boats by name (case-insensitive)
     * @param name The boat name to search for
     * @return List of boats containing the specified name
     */
    public List<Boat> searchBoatsByName(String name) {
        return boatRepository.findAll().stream()
                .filter(boat -> boat.getBoatName() != null && 
                               boat.getBoatName().toLowerCase().contains(name.toLowerCase()))
                .toList();
    }

    /**
     * Get total count of boats in database
     * @return Total number of boats
     */
    public long getBoatCount() {
        return boatRepository.count();
    }

    /**
     * Get count of boats by status
     * @param status The status to count
     * @return Number of boats with the given status
     */
    public long getBoatCountByStatus(String status) {
        return getBoatsByStatus(status).size();
    }
}