package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "*")
public class SetupController {

    @Autowired
    private UserService userService;

    @PostMapping("/create-users")
    public ResponseEntity<?> createTestUsers() {
        try {
            // Create test user
            Customer customer = new Customer();
            customer.setFirstName("Test");
            customer.setSecondName("User");
            customer.setEmail("test@gmail.com");
            customer.setPassword("password123");
            customer.setContactNo("123-456-7890");
            customer.setAddress("123 Test St");
            customer.setCity("Test City");
            customer.setStreet("Test Street");
            customer.setPostalCode("12345");
            customer.setStatus("AVAILABLE");
            
            userService.register(customer);

            // Create admin user
            Admin admin = new Admin();
            admin.setFirstName("Admin");
            admin.setSecondName("User");
            admin.setEmail("admin@gmail.com");
            admin.setPassword("admin123");
            admin.setContactNo("987-654-3210");
            admin.setAddress("456 Admin Ave");
            admin.setCity("Admin City");
            admin.setStreet("Admin Street");
            admin.setPostalCode("54321");
            admin.setStatus("AVAILABLE");
            
            userService.register(admin);

            // Create safari guide
            SafariGuide guide = new SafariGuide();
            guide.setFirstName("Safari");
            guide.setSecondName("Guide");
            guide.setEmail("guide@gmail.com");
            guide.setPassword("guide123");
            guide.setContactNo("555-123-4567");
            guide.setAddress("789 Safari Road");
            guide.setCity("Safari City");
            guide.setStreet("Safari Street");
            guide.setPostalCode("98765");
            guide.setCertification("Certified Marine Guide");
            guide.setHireDate("2023-01-15");
            guide.setStatus("AVAILABLE");
            
            userService.register(guide);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Test users created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create users: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/test-login")
    public ResponseEntity<?> testLogin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            if (email == null || password == null) {
                // Test with default credentials if none provided
                email = "admin@gmail.com";
                password = "admin123";
            }
            
            User user = userService.login(email, password);
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", user);
                response.put("role", user.getRole());
                response.put("message", "Login successful");
                return ResponseEntity.ok(response);
            } else {
                // Try to find user by email
                User foundUser = userService.getUserByEmail(email);
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid credentials");
                error.put("userExists", foundUser != null);
                if (foundUser != null) {
                    error.put("message", "User found but password incorrect");
                } else {
                    error.put("message", "User not found");
                }
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login test failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/create-it-users")
    public ResponseEntity<?> createITUsers() {
        try {
            // Create IT Support user
            ITSupport itSupport = new ITSupport();
            itSupport.setFirstName("IT");
            itSupport.setSecondName("Support");
            itSupport.setEmail("itsupport@gmail.com");
            itSupport.setPassword("password123");
            itSupport.setContactNo("555-IT-HELP");
            itSupport.setAddress("123 IT Street");
            itSupport.setCity("Tech City");
            itSupport.setStreet("Support Lane");
            itSupport.setPostalCode("90210");
            itSupport.setHireDate("2023-01-01");
            itSupport.setCertification("IT Support Specialist");
            itSupport.setStatus("AVAILABLE");
            
            userService.register(itSupport);

            // Create IT Assistant user
            ITAssistant itAssistant = new ITAssistant();
            itAssistant.setFirstName("IT");
            itAssistant.setSecondName("Assistant");
            itAssistant.setEmail("itassistant@gmail.com");
            itAssistant.setPassword("password123");
            itAssistant.setContactNo("555-IT-ASST");
            itAssistant.setAddress("456 Tech Avenue");
            itAssistant.setCity("Tech City");
            itAssistant.setStreet("Assistant Boulevard");
            itAssistant.setPostalCode("90211");
            itAssistant.setHireDate("2023-01-01");
            itAssistant.setCertification("IT Assistant");
            itAssistant.setStatus("AVAILABLE");
            
            userService.register(itAssistant);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "IT users created successfully");
            response.put("credentials", Map.of(
                "itSupport", Map.of("email", "itsupport@gmail.com", "password", "password123"),
                "itAssistant", Map.of("email", "itassistant@gmail.com", "password", "password123")
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create IT users: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}