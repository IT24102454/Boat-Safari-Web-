package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.dto.RoleAssignmentDto;
import com.boatsafari.managementsystem.dto.AssignResourcesDto;
import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.repository.UserRepository;
import com.boatsafari.managementsystem.service.UserService;
import com.boatsafari.managementsystem.service.TripService;
import com.boatsafari.managementsystem.service.BoatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFFMEMBER', 'SAFARIGUIDE', 'ITSUPPORT', 'ITASSISTANT')")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private TripService tripService;

    @Autowired
    private BoatService boatService;

    // === DASHBOARD ENDPOINTS ===

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get trip statistics
            List<Trip> allTrips = tripService.getAllTrips();
            stats.put("totalTrips", allTrips.size());
            
            // Get boat statistics  
            List<Boat> allBoats = boatService.getAllBoats();
            long availableBoats = allBoats.stream()
                .filter(boat -> "AVAILABLE".equals(boat.getStatus()))
                .count();
            stats.put("availableBoats", availableBoats);
            stats.put("totalBoats", allBoats.size());
            
            // Get guide statistics
            List<SafariGuide> allGuides = userService.getAllGuides();
            // For now, assume all guides are available since we don't have status field yet
            stats.put("availableGuides", allGuides.size());
            stats.put("totalGuides", allGuides.size());
            
            // Calculate capacity utilization
            int capacityUtilization = calculateCapacityUtilization(allTrips, allBoats);
            stats.put("capacityUtilization", capacityUtilization);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to load dashboard statistics: " + e.getMessage()));
        }
    }

    /**
     * Assign resources (boat and guide) to a trip
     */
    @PostMapping("/assign-resources")
    public ResponseEntity<Map<String, String>> assignResources(@RequestBody AssignResourcesDto assignmentDto) {
        try {
            // Validate trip exists
            Trip trip = tripService.getTripByIdDirect(assignmentDto.getTripId());
            if (trip == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trip not found"));
            }

            // Assign boat if provided
            if (assignmentDto.getBoatId() != null) {
                Boat boat = boatService.getBoatByIdDirect(assignmentDto.getBoatId());
                if (boat == null) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Boat not found"));
                }
                
                if (!"AVAILABLE".equals(boat.getStatus())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Boat is not available"));
                }
                
                trip.setBoat(boat);
                boat.setStatus("ASSIGNED");
                boatService.updateBoat(boat);
            }

            // Assign guide if provided
            if (assignmentDto.getGuideId() != null) {
                SafariGuide guide = userService.getGuideById(assignmentDto.getGuideId());
                if (guide == null) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Guide not found"));
                }
                
                // TODO: Add status checking when status field is available
                // if ("ASSIGNED".equals(guide.getStatus())) {
                //     return ResponseEntity.badRequest()
                //         .body(Map.of("error", "Guide is already assigned"));
                // }
                
                trip.setGuide(guide);
                // TODO: Update guide status when status field is available
                // guide.setStatus("ASSIGNED");
                // userService.updateUser(guide);
            }

            // Update trip
            tripService.updateTrip(trip);

            return ResponseEntity.ok(Map.of("message", "Resources assigned successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to assign resources: " + e.getMessage()));
        }
    }

    /**
     * Get all assignments (trips with their assigned resources)
     */
    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments() {
        try {
            List<Trip> trips = tripService.getAllTrips();
            List<Map<String, Object>> assignments = trips.stream()
                .filter(trip -> trip.getBoat() != null || trip.getGuide() != null)
                .map(trip -> {
                    Map<String, Object> assignment = new HashMap<>();
                    assignment.put("tripId", trip.getTripId());
                    assignment.put("tripName", trip.getName() != null ? trip.getName() : "Safari Trip");
                    assignment.put("date", trip.getDate());
                    assignment.put("boatName", trip.getBoat() != null ? trip.getBoat().getBoatName() : "Unassigned");
                    assignment.put("guideName", trip.getGuide() != null ? 
                        trip.getGuide().getFirstName() + " " + trip.getGuide().getSecondName() : "Unassigned");
                    assignment.put("status", "Confirmed");
                    return assignment;
                })
                .toList();

            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get real-time updates for the dashboard
     */
    @GetMapping("/real-time-updates")
    public ResponseEntity<List<Map<String, Object>>> getRealTimeUpdates() {
        try {
            // For now, return mock data - in a real application, this would fetch actual updates
            List<Map<String, Object>> updates = List.of(
                Map.of(
                    "time", java.time.LocalTime.now().toString(),
                    "message", "New trip booking received",
                    "type", "info"
                ),
                Map.of(
                    "time", java.time.LocalTime.now().minusMinutes(5).toString(),
                    "message", "Boat maintenance completed",
                    "type", "success"
                ),
                Map.of(
                    "time", java.time.LocalTime.now().minusMinutes(10).toString(),
                    "message", "Guide assignment updated",
                    "type", "info"
                )
            );
            
            return ResponseEntity.ok(updates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove assignment (unassign boat and guide from trip)
     */
    @DeleteMapping("/assignments/{tripId}")
    public ResponseEntity<Map<String, String>> removeAssignment(@PathVariable Long tripId) {
        try {
            Trip trip = tripService.getTripByIdDirect(tripId);
            if (trip == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trip not found"));
            }

            // Unassign boat if assigned
            if (trip.getBoat() != null) {
                Boat boat = trip.getBoat();
                boat.setStatus("AVAILABLE");
                boatService.updateBoat(boat);
                trip.setBoat(null);
            }

            // Unassign guide if assigned
            if (trip.getGuide() != null) {
                // TODO: Update guide status when status field is available
                // SafariGuide guide = trip.getGuide();
                // guide.setStatus("AVAILABLE");
                // userService.updateUser(guide);
                trip.setGuide(null);
            }

            // Update trip
            tripService.updateTrip(trip);

            return ResponseEntity.ok(Map.of("message", "Assignment removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to remove assignment: " + e.getMessage()));
        }
    }

    /**
     * Get trip details for editing
     */
    @GetMapping("/trips/{tripId}")
    public ResponseEntity<?> getTripForEdit(@PathVariable Long tripId) {
        try {
            Trip trip = tripService.getTripByIdDirect(tripId);
            if (trip == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trip not found"));
            }

            Map<String, Object> tripData = new HashMap<>();
            tripData.put("tripId", trip.getTripId());
            tripData.put("name", trip.getName());
            tripData.put("description", trip.getDescription());
            tripData.put("date", trip.getDate());
            tripData.put("startTime", trip.getStartTime());
            tripData.put("endTime", trip.getEndTime());
            tripData.put("duration", trip.getDuration());
            tripData.put("capacity", trip.getCapacity());
            tripData.put("price", trip.getPrice());
            tripData.put("location", trip.getLocation());
            tripData.put("route", trip.getRoute());
            tripData.put("imageUrl", trip.getImageUrl());

            return ResponseEntity.ok(tripData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch trip details: " + e.getMessage()));
        }
    }

    /**
     * Update trip details
     */
    @PutMapping("/trips/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId, @RequestBody Map<String, Object> tripData) {
        try {
            Trip trip = tripService.getTripByIdDirect(tripId);
            if (trip == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Trip not found"));
            }

            // Update trip fields
            if (tripData.containsKey("name")) {
                trip.setName((String) tripData.get("name"));
            }
            if (tripData.containsKey("description")) {
                trip.setDescription((String) tripData.get("description"));
            }
            if (tripData.containsKey("date")) {
                trip.setDate(java.time.LocalDate.parse((String) tripData.get("date")));
            }
            if (tripData.containsKey("startTime")) {
                trip.setStartTime(java.time.LocalTime.parse((String) tripData.get("startTime")));
            }
            if (tripData.containsKey("endTime")) {
                trip.setEndTime(java.time.LocalTime.parse((String) tripData.get("endTime")));
            }
            if (tripData.containsKey("duration")) {
                trip.setDuration((Integer) tripData.get("duration"));
            }
            if (tripData.containsKey("capacity")) {
                trip.setCapacity((Integer) tripData.get("capacity"));
            }
            if (tripData.containsKey("price")) {
                Object priceObj = tripData.get("price");
                if (priceObj instanceof Number) {
                    trip.setPrice(((Number) priceObj).doubleValue());
                } else if (priceObj instanceof String) {
                    trip.setPrice(Double.parseDouble((String) priceObj));
                }
            }
            if (tripData.containsKey("location")) {
                trip.setLocation((String) tripData.get("location"));
            }
            if (tripData.containsKey("route")) {
                trip.setRoute((String) tripData.get("route"));
            }
            if (tripData.containsKey("imageUrl")) {
                trip.setImageUrl((String) tripData.get("imageUrl"));
            }

            Trip updatedTrip = tripService.updateTrip(trip);
            return ResponseEntity.ok(Map.of("message", "Trip updated successfully", "trip", updatedTrip));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update trip: " + e.getMessage()));
        }
    }

    /**
     * Calculate overall capacity utilization
     */
    private int calculateCapacityUtilization(List<Trip> trips, List<Boat> boats) {
        if (boats.isEmpty()) return 0;
        
        long assignedBoats = boats.stream()
            .filter(boat -> "ASSIGNED".equals(boat.getStatus()))
            .count();
            
        return (int) Math.round((double) assignedBoats / boats.size() * 100);
    }

    // === STAFF MEMBER MANAGEMENT ENDPOINTS ===

    /**
     * Endpoint for admins to assign roles to staff members
     */
    @PutMapping("/assign-role")
    public ResponseEntity<?> assignRole(@RequestBody RoleAssignmentDto roleAssignment) {
        try {
            System.out.println("Received role assignment request: " + roleAssignment.getUserId() + " -> " + roleAssignment.getRole());
            User updatedUser = userService.assignRole(roleAssignment.getUserId(), roleAssignment.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Role successfully updated");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update role: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllStaffMembers() {
        List<User> allUsers = userRepository.findAll();

        // Filter users to only include staff members (StaffMember, SafariGuide, ITSupport, ITAssistant)
        List<User> staffMembers = allUsers.stream()
                .filter(user -> user instanceof StaffMember ||
                               user instanceof SafariGuide ||
                               user instanceof ITSupport ||
                               user instanceof ITAssistant)
                .collect(Collectors.toList());

        return ResponseEntity.ok(staffMembers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getStaffMemberById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addStaffMember(@RequestBody Map<String, Object> staffData) {
        try {
            User newStaffMember = createStaffMemberFromRole((String) staffData.get("role"));

            // Set common properties
            newStaffMember.setFirstName((String) staffData.get("firstName"));
            newStaffMember.setSecondName((String) staffData.get("lastName"));
            newStaffMember.setEmail((String) staffData.get("email"));

            // Encode password if provided
            String password = (String) staffData.get("password");
            if (password != null && !password.isEmpty()) {
                newStaffMember.setPassword(passwordEncoder.encode(password));
            } else {
                newStaffMember.setPassword(passwordEncoder.encode("defaultPassword123"));
            }

            newStaffMember.setContactNo((String) staffData.get("contactNo"));

            // Set optional fields if provided
            if (staffData.containsKey("address")) {
                newStaffMember.setAddress((String) staffData.get("address"));
            }

            if (staffData.containsKey("city")) {
                newStaffMember.setCity((String) staffData.get("city"));
            }

            if (staffData.containsKey("street")) {
                newStaffMember.setStreet((String) staffData.get("street"));
            }

            if (staffData.containsKey("postalCode")) {
                newStaffMember.setPostalCode((String) staffData.get("postalCode"));
            }

            if (staffData.containsKey("hireDate")) {
                newStaffMember.setHireDate((String) staffData.get("hireDate"));
            } else {
                // Default to current date in YYYY-MM-DD format
                java.time.LocalDate now = java.time.LocalDate.now();
                newStaffMember.setHireDate(now.toString());
            }

            if (staffData.containsKey("certification")) {
                newStaffMember.setCertification((String) staffData.get("certification"));
            }

            // Save the new staff member
            User savedStaff = userRepository.save(newStaffMember);
            return ResponseEntity.ok(savedStaff);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add staff member: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaffMember(@PathVariable Long id, @RequestBody Map<String, Object> staffData) {
        try {
            Optional<User> staffOpt = userRepository.findById(id);
            if (!staffOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User staff = staffOpt.get();

            // Update basic info
            if (staffData.containsKey("firstName")) {
                staff.setFirstName((String) staffData.get("firstName"));
            }

            if (staffData.containsKey("lastName")) {
                staff.setSecondName((String) staffData.get("lastName"));
            }

            if (staffData.containsKey("email")) {
                staff.setEmail((String) staffData.get("email"));
            }

            // Update password only if provided
            if (staffData.containsKey("password") && staffData.get("password") != null) {
                String password = (String) staffData.get("password");
                if (!password.isEmpty()) {
                    staff.setPassword(passwordEncoder.encode(password));
                }
            }

            if (staffData.containsKey("contactNo")) {
                staff.setContactNo((String) staffData.get("contactNo"));
            }

            // Update optional fields
            if (staffData.containsKey("address")) {
                staff.setAddress((String) staffData.get("address"));
            }

            if (staffData.containsKey("city")) {
                staff.setCity((String) staffData.get("city"));
            }

            if (staffData.containsKey("street")) {
                staff.setStreet((String) staffData.get("street"));
            }

            if (staffData.containsKey("postalCode")) {
                staff.setPostalCode((String) staffData.get("postalCode"));
            }

            if (staffData.containsKey("hireDate")) {
                staff.setHireDate((String) staffData.get("hireDate"));
            }

            if (staffData.containsKey("certification")) {
                staff.setCertification((String) staffData.get("certification"));
            }

            // Save the updated staff member
            User updatedStaff = userRepository.save(staff);
            return ResponseEntity.ok(updatedStaff);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update staff member: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaffMember(@PathVariable Long id) {
        try {
            Optional<User> staffOpt = userRepository.findById(id);
            if (!staffOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            userRepository.deleteById(id);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete staff member: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private User createStaffMemberFromRole(String role) {
        switch (role != null ? role.toUpperCase() : "") {
            case "SAFARI_GUIDE":
            case "GUIDE":
                return new SafariGuide();
            case "IT_SUPPORT":
            case "SUPPORT":
                return new ITSupport();
            case "IT_ASSISTANT":
            case "ASSISTANT":
                return new ITAssistant();
            default:
                return new StaffMember();
        }
    }
}
