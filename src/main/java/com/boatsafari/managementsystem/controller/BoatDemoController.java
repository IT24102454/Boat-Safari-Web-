package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Boat;
import com.boatsafari.managementsystem.service.BoatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * Demonstration controller showing various ways to retrieve boat data from database
 */
@RestController
@RequestMapping("/api/boat-demo")
@CrossOrigin(origins = "*")
public class BoatDemoController {

    @Autowired
    private BoatService boatService;

    /**
     * GET ALL BOATS - Retrieve all boat records from database
     * URL: /api/boat-demo/all
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllBoatsDemo() {
        try {
            List<Boat> boats = boatService.getAllBoats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Retrieved all boats from database table 'boat'");
            response.put("totalCount", boats.size());
            response.put("boats", boats);
            response.put("query", "SELECT * FROM boat");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve boats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET BOAT BY ID - Retrieve specific boat by ID
     * URL: /api/boat-demo/id/{id}
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<Map<String, Object>> getBoatByIdDemo(@PathVariable Long id) {
        try {
            Optional<Boat> boatOpt = boatService.getBoatById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (boatOpt.isPresent()) {
                response.put("message", "Retrieved boat with ID " + id + " from database");
                response.put("boat", boatOpt.get());
                response.put("query", "SELECT * FROM boat WHERE boat_id = " + id);
            } else {
                response.put("message", "No boat found with ID " + id);
                response.put("boat", null);
                response.put("query", "SELECT * FROM boat WHERE boat_id = " + id + " (No results)");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve boat: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET BOATS BY STATUS - Filter boats by status
     * URL: /api/boat-demo/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getBoatsByStatusDemo(@PathVariable String status) {
        try {
            List<Boat> boats = boatService.getBoatsByStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Retrieved boats with status '" + status + "' from database");
            response.put("totalCount", boats.size());
            response.put("boats", boats);
            response.put("query", "SELECT * FROM boat WHERE status = '" + status + "'");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve boats by status: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET AVAILABLE BOATS - Get only available boats
     * URL: /api/boat-demo/available
     */
    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> getAvailableBoatsDemo() {
        try {
            List<Boat> boats = boatService.getAvailableBoats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Retrieved available boats from database");
            response.put("totalCount", boats.size());
            response.put("boats", boats);
            response.put("query", "SELECT * FROM boat WHERE status = 'AVAILABLE'");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve available boats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET BOATS BY TYPE - Filter boats by type
     * URL: /api/boat-demo/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<Map<String, Object>> getBoatsByTypeDemo(@PathVariable String type) {
        try {
            List<Boat> boats = boatService.getBoatsByType(type);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Retrieved boats of type '" + type + "' from database");
            response.put("totalCount", boats.size());
            response.put("boats", boats);
            response.put("query", "SELECT * FROM boat WHERE type = '" + type + "'");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve boats by type: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET BOATS BY CAPACITY - Filter boats by minimum capacity
     * URL: /api/boat-demo/capacity/{minCapacity}
     */
    @GetMapping("/capacity/{minCapacity}")
    public ResponseEntity<Map<String, Object>> getBoatsByCapacityDemo(@PathVariable Integer minCapacity) {
        try {
            List<Boat> boats = boatService.getBoatsByMinCapacity(minCapacity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Retrieved boats with capacity >= " + minCapacity + " from database");
            response.put("totalCount", boats.size());
            response.put("boats", boats);
            response.put("query", "SELECT * FROM boat WHERE capacity >= " + minCapacity);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve boats by capacity: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * SEARCH BOATS BY NAME - Search boats by name
     * URL: /api/boat-demo/search/{name}
     */
    @GetMapping("/search/{name}")
    public ResponseEntity<Map<String, Object>> searchBoatsByNameDemo(@PathVariable String name) {
        try {
            List<Boat> boats = boatService.searchBoatsByName(name);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Searched boats containing '" + name + "' in name");
            response.put("totalCount", boats.size());
            response.put("boats", boats);
            response.put("query", "SELECT * FROM boat WHERE boat_name LIKE '%" + name + "%'");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to search boats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET BOAT STATISTICS - Get database statistics
     * URL: /api/boat-demo/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getBoatStatsDemo() {
        try {
            long totalCount = boatService.getBoatCount();
            long availableCount = boatService.getBoatCountByStatus("AVAILABLE");
            long maintenanceCount = boatService.getBoatCountByStatus("MAINTENANCE");
            long outOfServiceCount = boatService.getBoatCountByStatus("OUT_OF_SERVICE");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Retrieved boat statistics from database");
            response.put("totalBoats", totalCount);
            response.put("availableBoats", availableCount);
            response.put("boatsInMaintenance", maintenanceCount);
            response.put("boatsOutOfService", outOfServiceCount);
            response.put("queries", Map.of(
                "total", "SELECT COUNT(*) FROM boat",
                "available", "SELECT COUNT(*) FROM boat WHERE status = 'AVAILABLE'",
                "maintenance", "SELECT COUNT(*) FROM boat WHERE status = 'MAINTENANCE'",
                "outOfService", "SELECT COUNT(*) FROM boat WHERE status = 'OUT_OF_SERVICE'"
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve boat statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * DATABASE TABLE INFO - Get database table structure information
     * URL: /api/boat-demo/table-info
     */
    @GetMapping("/table-info")
    public ResponseEntity<Map<String, Object>> getTableInfoDemo() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Boat database table information");
        response.put("tableName", "boat");
        response.put("entityClass", "com.boatsafari.managementsystem.model.Boat");
        response.put("columns", Map.of(
            "boat_id", "BIGINT PRIMARY KEY AUTO_INCREMENT",
            "boat_name", "VARCHAR(255)",
            "model", "VARCHAR(255)",
            "type", "VARCHAR(255)",
            "capacity", "INTEGER",
            "registration_number", "VARCHAR(255)",
            "status", "VARCHAR(255)",
            "features", "TEXT",
            "description", "VARCHAR(500)"
        ));
        response.put("availableEndpoints", List.of(
            "GET /api/boat-demo/all - Get all boats",
            "GET /api/boat-demo/id/{id} - Get boat by ID",
            "GET /api/boat-demo/status/{status} - Get boats by status",
            "GET /api/boat-demo/available - Get available boats",
            "GET /api/boat-demo/type/{type} - Get boats by type",
            "GET /api/boat-demo/capacity/{minCapacity} - Get boats by minimum capacity",
            "GET /api/boat-demo/search/{name} - Search boats by name",
            "GET /api/boat-demo/stats - Get boat statistics"
        ));
        
        return ResponseEntity.ok(response);
    }
}