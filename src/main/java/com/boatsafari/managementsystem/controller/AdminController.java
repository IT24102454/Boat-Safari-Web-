package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.service.UserService;
import com.boatsafari.managementsystem.service.TripService;
import com.boatsafari.managementsystem.service.BookingService;
import com.boatsafari.managementsystem.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private TripService tripService;

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Get all users for admin management
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userService.getUserById(id);
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(userOpt.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create new user (admin only)
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.register(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update user (admin only)
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            userDetails.setUserId(id);
            User updatedUser = userService.updateUser(userDetails);
            if (updatedUser != null) {
                return ResponseEntity.ok(updatedUser);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Delete user (admin only)
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update user role (special handling for discriminator column)
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("role");
            if (newRole == null || newRole.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Role is required");
                return ResponseEntity.badRequest().body(error);
            }

            User updatedUser = userService.updateUserRole(id, newRole.toUpperCase());
            if (updatedUser != null) {
                return ResponseEntity.ok(updatedUser);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user role: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Simple test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Admin API is working!");
    }

    /**
     * Get system analytics/dashboard data (simplified for testing)
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        try {
            Map<String, Object> analytics = new HashMap<>();
            
            // Get user count
            List<User> allUsers = userService.getAllUsers();
            long totalUsers = allUsers.size();
            analytics.put("totalUsers", totalUsers);
            
            // Get active trips count
            List<com.boatsafari.managementsystem.model.Trip> allTrips = tripService.getAllTrips();
            long activeTrips = allTrips.size();
            analytics.put("activeTrips", activeTrips);
            
            // Get total bookings count
            long totalBookings = bookingRepository.count();
            analytics.put("monthlyBookings", totalBookings);
            
            // Calculate total revenue from all bookings (safely)
            double totalRevenue = 0.0;
            try {
                List<com.boatsafari.managementsystem.model.Booking> bookings = bookingRepository.findAll();
                totalRevenue = bookings.stream()
                    .filter(booking -> booking.getTotalCost() > 0)
                    .mapToDouble(booking -> booking.getTotalCost())
                    .sum();
            } catch (Exception e) {
                System.out.println("Error calculating revenue: " + e.getMessage());
                totalRevenue = 0.0;
            }
            analytics.put("monthlyRevenue", totalRevenue);
            
            System.out.println("Analytics data: " + analytics);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error in analytics endpoint: " + e.getMessage());
            
            // Return default values on error
            Map<String, Object> defaultAnalytics = new HashMap<>();
            defaultAnalytics.put("totalUsers", 0);
            defaultAnalytics.put("activeTrips", 0);
            defaultAnalytics.put("monthlyBookings", 0);
            defaultAnalytics.put("monthlyRevenue", 0.0);
            return ResponseEntity.ok(defaultAnalytics);
        }
    }
}