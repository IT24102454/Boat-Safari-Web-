package com.boatsafari.managementsystem.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Concrete Strategy for Credit Card Payment
 * Implements the Strategy pattern for different payment methods
 */
@Component("creditCardPayment")
public class CreditCardPaymentStrategy implements PaymentStrategy {
    
    private static final Pattern CREDIT_CARD_PATTERN = 
        Pattern.compile("^[0-9]{13,19}$");
    
    @Override
    public PaymentResult processPayment(BigDecimal amount, String customerEmail, String paymentDetails) {
        if (!validatePaymentDetails(paymentDetails)) {
            return new PaymentResult(false, "Invalid credit card number", null, 0.0);
        }
        
        // Simulate credit card processing
        try {
            Thread.sleep(2000); // Simulate processing delay
            
            // Generate transaction ID
            String transactionId = "CC-" + UUID.randomUUID().toString().substring(0, 8);
            double fee = getProcessingFee(amount);
            
            return new PaymentResult(true, 
                "Credit card payment successful", 
                transactionId, 
                fee);
                
        } catch (InterruptedException e) {
            return new PaymentResult(false, "Payment processing interrupted", null, 0.0);
        }
    }
    
    @Override
    public boolean validatePaymentDetails(String paymentDetails) {
        return paymentDetails != null && 
               CREDIT_CARD_PATTERN.matcher(paymentDetails.replaceAll("\\s+", "")).matches();
    }
    
    @Override
    public String getPaymentMethodName() {
        return "CREDIT_CARD";
    }
    
    @Override
    public double getProcessingFee(BigDecimal amount) {
        // 2.5% processing fee for credit cards
        return amount.multiply(BigDecimal.valueOf(0.025)).doubleValue();
    }
}