package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.service.PaymentProcessingService;
import com.boatsafari.managementsystem.service.BookingService;
import com.boatsafari.managementsystem.strategy.PaymentResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Demo Controller to showcase Design Patterns implementation
 * This demonstrates both Strategy and Observer patterns in action
 */
@RestController
@RequestMapping("/api/design-patterns/demo")
@CrossOrigin(origins = "*")
public class DesignPatternDemoController {

    @Autowired
    private PaymentProcessingService paymentService;
    
    @Autowired
    private BookingService bookingService;

    /**
     * Demonstrate Strategy Pattern - Payment Processing
     * Shows how different payment methods are handled using Strategy pattern
     */
    @PostMapping("/payment/process")
    public ResponseEntity<?> demonstrateStrategyPattern(@RequestBody PaymentDemoRequest request) {
        try {
            System.out.println("\n🎯 === STRATEGY PATTERN DEMONSTRATION ===");
            System.out.println("Processing payment with: " + request.getPaymentMethod());
            
            PaymentResult result = paymentService.processPayment(
                request.getPaymentMethod(),
                new BigDecimal(request.getAmount()),
                request.getCustomerEmail(),
                request.getPaymentDetails()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            response.put("transactionId", result.getTransactionId());
            response.put("processingFee", result.getProcessingFee());
            response.put("totalAmount", request.getAmount() + result.getProcessingFee());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Payment processing failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get available payment methods (Strategy Pattern)
     */
    @GetMapping("/payment/methods")
    public ResponseEntity<List<String>> getPaymentMethods() {
        System.out.println("\n📋 Available Payment Methods (Strategy Pattern):");
        List<String> methods = paymentService.getAvailablePaymentMethods();
        methods.forEach(method -> System.out.println("  - " + method));
        
        return ResponseEntity.ok(methods);
    }

    /**
     * Calculate processing fees for different payment methods
     */
    @GetMapping("/payment/fees")
    public ResponseEntity<?> calculateFees(@RequestParam double amount) {
        System.out.println("\n💰 Calculating fees for amount: $" + amount);
        
        Map<String, Double> fees = new HashMap<>();
        List<String> methods = paymentService.getAvailablePaymentMethods();
        
        for (String method : methods) {
            double fee = paymentService.calculateProcessingFee(method, new BigDecimal(amount));
            fees.put(method, fee);
            System.out.println("  " + method + ": $" + fee);
        }
        
        return ResponseEntity.ok(fees);
    }

    /**
     * Demonstrate Observer Pattern - Booking Status Update
     * Shows how multiple observers react to booking changes
     */
    @PutMapping("/booking/{bookingId}/status")
    public ResponseEntity<?> demonstrateObserverPattern(
            @PathVariable Long bookingId,
            @RequestParam String newStatus) {
        try {
            System.out.println("\n👀 === OBSERVER PATTERN DEMONSTRATION ===");
            System.out.println("Updating booking " + bookingId + " to status: " + newStatus);
            
            bookingService.updateBookingStatus(bookingId, newStatus);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking status updated successfully");
            response.put("bookingId", bookingId);
            response.put("newStatus", newStatus);
            response.put("observersNotified", "All observers have been notified of the change");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Status update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Validate payment details for specific method (Strategy Pattern)
     */
    @PostMapping("/payment/validate")
    public ResponseEntity<?> validatePaymentDetails(@RequestBody ValidationRequest request) {
        System.out.println("\n✅ Validating payment details for: " + request.getPaymentMethod());
        
        boolean isValid = paymentService.validatePaymentDetails(
            request.getPaymentMethod(), 
            request.getPaymentDetails()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("paymentMethod", request.getPaymentMethod());
        response.put("message", isValid ? "Payment details are valid" : "Invalid payment details");
        
        return ResponseEntity.ok(response);
    }

    // DTOs for demo endpoints
    public static class PaymentDemoRequest {
        private String paymentMethod;
        private double amount;
        private String customerEmail;
        private String paymentDetails;
        
        // Getters and setters
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        
        public String getPaymentDetails() { return paymentDetails; }
        public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
    }
    
    public static class ValidationRequest {
        private String paymentMethod;
        private String paymentDetails;
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public String getPaymentDetails() { return paymentDetails; }
        public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
    }
}