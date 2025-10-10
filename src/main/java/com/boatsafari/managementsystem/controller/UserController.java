package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.model.SafariGuide;
import com.boatsafari.managementsystem.model.StaffMember;
import com.boatsafari.managementsystem.model.Admin;
import com.boatsafari.managementsystem.model.Customer;
import com.boatsafari.managementsystem.model.ITSupport;
import com.boatsafari.managementsystem.model.ITAssistant;
import com.boatsafari.managementsystem.service.UserService;
import com.boatsafari.managementsystem.util.JwtUtils;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        if (user != null) {
            String token = jwtUtils.generateToken(user);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", normalizeRole(user));
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body("Invalid credentials");
    }

    /**
     * Normalize role to handle legacy data and ensure consistency
     */
    private String normalizeRole(User user) {
        // Return the actual discriminator value used in the database
        if (user instanceof Admin) {
            return "ADMIN";
        } else if (user instanceof SafariGuide) {
            return "SAFARI_GUIDE";
        } else if (user instanceof ITSupport) {
            return "IT_SUPPORT";
        } else if (user instanceof ITAssistant) {
            return "IT_ASSISTANT";
        } else if (user instanceof StaffMember) {
            return "STAFF";
        } else if (user instanceof Customer) {
            return "CUSTOMER";
        }
        
        // Fallback to the role field value
        return user.getRole();
    }

    /**
     * Get the currently logged in user's profile
     */
    @GetMapping("/user/profile")
    public ResponseEntity<User> getUserProfile() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(currentUser);
    }

    /**
     * Update the currently logged in user's profile
     */
    @PutMapping("/user/profile")
    public ResponseEntity<User> updateUserProfile(@RequestBody User updatedUser) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        // Don't allow changing the user ID or role from this endpoint
        updatedUser.setUserId(currentUser.getUserId());
        updatedUser.setRoleType(currentUser.getRoleType());

        // Don't update password through this endpoint
        updatedUser.setPassword(currentUser.getPassword());

        // Update the user details
        User saved = userService.updateUser(updatedUser);
        return ResponseEntity.ok(saved);
    }

    /**
     * Change the password of the currently logged in user
     */
    @PostMapping("/user/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        userService.changePassword(currentUser.getUserId(), request.getPassword());
        return ResponseEntity.ok().build();
    }

    /**
     * Helper method to get the current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();
        return userService.getUserByEmail(email);
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    static class PasswordChangeRequest {
        private String password;
    }
}