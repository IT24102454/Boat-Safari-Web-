package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.dto.RoleAssignmentDto;
import com.boatsafari.managementsystem.model.ITAssistant;
import com.boatsafari.managementsystem.model.ITSupport;
import com.boatsafari.managementsystem.model.SafariGuide;
import com.boatsafari.managementsystem.model.StaffMember;
import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.repository.UserRepository;
import com.boatsafari.managementsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

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
