package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.strategy.PaymentStrategy;
import com.boatsafari.managementsystem.strategy.PaymentResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Context class for Strategy Pattern
 * This demonstrates how to use Strategy pattern in Spring Boot
 * 
 * Benefits:
 * 1. Easy to add new payment methods without changing existing code
 * 2. Each payment method is encapsulated in its own class
 * 3. Runtime selection of payment strategy
 * 4. Follows Open/Closed Principle
 */
@Service
public class PaymentProcessingService {
    
    private final Map<String, PaymentStrategy> paymentStrategies;
    
    /**
     * Constructor injection - Spring automatically injects all PaymentStrategy implementations
     * This is the beauty of Strategy pattern with Spring DI
     */
    @Autowired
    public PaymentProcessingService(List<PaymentStrategy> strategies) {
        this.paymentStrategies = strategies.stream()
            .collect(Collectors.toMap(
                PaymentStrategy::getPaymentMethodName,
                Function.identity()
            ));
    }
    
    /**
     * Process payment using the specified strategy
     * This method delegates to the appropriate strategy at runtime
     */
    public PaymentResult processPayment(String paymentMethod, BigDecimal amount, 
                                      String customerEmail, String paymentDetails) {
        PaymentStrategy strategy = getPaymentStrategy(paymentMethod);
        
        if (strategy == null) {
            return new PaymentResult(false, 
                "Unsupported payment method: " + paymentMethod, 
                null, 0.0);
        }
        
        // Log the processing (for demonstration)
        System.out.println("Processing payment using: " + strategy.getPaymentMethodName());
        System.out.println("Amount: $" + amount);
        System.out.println("Processing fee: $" + strategy.getProcessingFee(amount));
        
        return strategy.processPayment(amount, customerEmail, paymentDetails);
    }
    
    /**
     * Get available payment methods
     */
    public List<String> getAvailablePaymentMethods() {
        return paymentStrategies.keySet().stream()
            .sorted()
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate processing fee for a given method and amount
     */
    public double calculateProcessingFee(String paymentMethod, BigDecimal amount) {
        PaymentStrategy strategy = getPaymentStrategy(paymentMethod);
        return strategy != null ? strategy.getProcessingFee(amount) : 0.0;
    }
    
    /**
     * Validate payment details for a specific method
     */
    public boolean validatePaymentDetails(String paymentMethod, String paymentDetails) {
        PaymentStrategy strategy = getPaymentStrategy(paymentMethod);
        return strategy != null && strategy.validatePaymentDetails(paymentDetails);
    }
    
    private PaymentStrategy getPaymentStrategy(String paymentMethod) {
        return paymentStrategies.get(paymentMethod.toUpperCase());
    }
}