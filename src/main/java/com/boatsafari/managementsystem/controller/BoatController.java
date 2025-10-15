// src/main/java/com/boatsafari/managementsystem/controller/BoatController.java
package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Boat;
import com.boatsafari.managementsystem.service.BoatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/boats")
@CrossOrigin(origins = "*")
public class BoatController {

    @Autowired
    private BoatService boatService;

    @GetMapping
    public ResponseEntity<List<Boat>> getAll() {
        return ResponseEntity.ok(boatService.getAllBoats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Boat> getById(@PathVariable Long id) {
        Optional<Boat> b = boatService.getBoatById(id);
        return b.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBoat(@RequestBody Boat boat) {
        try {
            // Set default status if not provided
            if (boat.getStatus() == null || boat.getStatus().isEmpty()) {
                boat.setStatus("AVAILABLE");
            }
            Boat savedBoat = boatService.saveBoat(boat);
            return ResponseEntity.ok(savedBoat);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create boat: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBoat(@PathVariable Long id, @RequestBody Boat boatDetails) {
        try {
            Optional<Boat> boatOpt = boatService.getBoatById(id);
            if (boatOpt.isPresent()) {
                boatDetails.setBoatId(id);
                Boat updatedBoat = boatService.updateBoat(boatDetails);
                return ResponseEntity.ok(updatedBoat);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update boat: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBoatStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        try {
            Optional<Boat> boatOpt = boatService.getBoatById(id);
            if (boatOpt.isPresent()) {
                Boat boat = boatOpt.get();
                boat.setStatus(request.getStatus());
                Boat updatedBoat = boatService.updateBoat(boat);
                return ResponseEntity.ok(updatedBoat);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update boat status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBoat(@PathVariable Long id) {
        try {
            if (boatService.getBoatById(id).isPresent()) {
                boatService.deleteBoat(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete boat: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<List<Boat>> testGetAllBoats() {
        try {
            List<Boat> boats = boatService.getAllBoats();
            return ResponseEntity.ok(boats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Boat>> getAvailableBoats() {
        try {
            List<Boat> boats = boatService.getAvailableBoats();
            return ResponseEntity.ok(boats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Boat>> getBoatsByType(@PathVariable String type) {
        try {
            List<Boat> boats = boatService.getBoatsByType(type);
            return ResponseEntity.ok(boats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/capacity/{minCapacity}")
    public ResponseEntity<List<Boat>> getBoatsByMinCapacity(@PathVariable Integer minCapacity) {
        try {
            List<Boat> boats = boatService.getBoatsByMinCapacity(minCapacity);
            return ResponseEntity.ok(boats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<Boat>> searchBoatsByName(@PathVariable String name) {
        try {
            List<Boat> boats = boatService.searchBoatsByName(name);
            return ResponseEntity.ok(boats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getBoatCount() {
        try {
            long count = boatService.getBoatCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(0L);
        }
    }

    // Request DTOs
    public static class StatusUpdateRequest {
        private String status;
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}