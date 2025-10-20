package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.repository.PaymentRepository;
import com.boatsafari.managementsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "*")
public class SetupController {

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentRepository paymentRepository;

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

    @PostMapping("/sample-payments")
    public ResponseEntity<Map<String, Object>> createSamplePayments() {
        try {
            // Create sample payments
            Payment payment1 = new Payment();
            payment1.setPaymentMethod("Card");
            payment1.setPaymentDate(LocalDateTime.now().minusDays(1));
            payment1.setAmount(250.00);
            payment1.setStatus("Completed");
            payment1.setCardHolderName("John Smith");
            paymentRepository.save(payment1);

            Payment payment2 = new Payment();
            payment2.setPaymentMethod("Card");
            payment2.setPaymentDate(LocalDateTime.now().minusDays(2));
            payment2.setAmount(180.00);
            payment2.setStatus("Completed");
            payment2.setCardHolderName("Jane Doe");
            paymentRepository.save(payment2);

            Payment payment3 = new Payment();
            payment3.setPaymentMethod("On Arrival");
            payment3.setPaymentDate(LocalDateTime.now().minusDays(3));
            payment3.setAmount(320.00);
            payment3.setStatus("Pending");
            paymentRepository.save(payment3);

            Payment payment4 = new Payment();
            payment4.setPaymentMethod("Card");
            payment4.setPaymentDate(LocalDateTime.now().minusDays(4));
            payment4.setAmount(450.00);
            payment4.setStatus("Completed");
            payment4.setCardHolderName("Mike Johnson");
            paymentRepository.save(payment4);

            Payment payment5 = new Payment();
            payment5.setPaymentMethod("Card");
            payment5.setPaymentDate(LocalDateTime.now().minusDays(5));
            payment5.setAmount(290.00);
            payment5.setStatus("Failed");
            payment5.setCardHolderName("Sarah Wilson");
            paymentRepository.save(payment5);

            Payment payment6 = new Payment();
            payment6.setPaymentMethod("On Arrival");
            payment6.setPaymentDate(LocalDateTime.now().minusDays(6));
            payment6.setAmount(380.00);
            payment6.setStatus("Completed");
            paymentRepository.save(payment6);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sample payments created successfully");
            response.put("count", 6);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create sample payments");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/payment-count")
    public ResponseEntity<Map<String, Object>> getPaymentCount() {
        try {
            long count = paymentRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get payment count");
            errorResponse.put("details", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}