package com.boatsafari.managementsystem.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Concrete Strategy for PayPal Payment
 * Demonstrates Strategy pattern with different payment processing logic
 */
@Component("paypalPayment")
public class PayPalPaymentStrategy implements PaymentStrategy {
    
    @Override
    public PaymentResult processPayment(BigDecimal amount, String customerEmail, String paymentDetails) {
        if (!validatePaymentDetails(paymentDetails)) {
            return new PaymentResult(false, "Invalid PayPal email", null, 0.0);
        }
        
        // Simulate PayPal API call
        try {
            Thread.sleep(1500); // Simulate API delay
            
            String transactionId = "PP-" + UUID.randomUUID().toString().substring(0, 8);
            double fee = getProcessingFee(amount);
            
            return new PaymentResult(true, 
                "PayPal payment successful", 
                transactionId, 
                fee);
                
        } catch (InterruptedException e) {
            return new PaymentResult(false, "PayPal processing failed", null, 0.0);
        }
    }
    
    @Override
    public boolean validatePaymentDetails(String paymentDetails) {
        // Validate email format for PayPal
        return paymentDetails != null && 
               paymentDetails.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    @Override
    public String getPaymentMethodName() {
        return "PAYPAL";
    }
    
    @Override
    public double getProcessingFee(BigDecimal amount) {
        // 3.0% processing fee for PayPal
        return amount.multiply(BigDecimal.valueOf(0.030)).doubleValue();
    }
}