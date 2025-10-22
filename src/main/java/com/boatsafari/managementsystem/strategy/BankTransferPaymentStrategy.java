package com.boatsafari.managementsystem.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Concrete Strategy for Bank Transfer Payment
 * Shows flexibility of Strategy pattern for different payment methods
 */
@Component("bankTransferPayment")
public class BankTransferPaymentStrategy implements PaymentStrategy {
    
    @Override
    public PaymentResult processPayment(BigDecimal amount, String customerEmail, String paymentDetails) {
        if (!validatePaymentDetails(paymentDetails)) {
            return new PaymentResult(false, "Invalid bank account details", null, 0.0);
        }
        
        // Simulate bank transfer processing
        try {
            Thread.sleep(3000); // Bank transfers take longer
            
            String transactionId = "BT-" + UUID.randomUUID().toString().substring(0, 8);
            double fee = getProcessingFee(amount);
            
            return new PaymentResult(true, 
                "Bank transfer initiated successfully", 
                transactionId, 
                fee);
                
        } catch (InterruptedException e) {
            return new PaymentResult(false, "Bank transfer failed", null, 0.0);
        }
    }
    
    @Override
    public boolean validatePaymentDetails(String paymentDetails) {
        // Validate account number format (simple validation)
        return paymentDetails != null && 
               paymentDetails.matches("^[0-9]{10,20}$");
    }
    
    @Override
    public String getPaymentMethodName() {
        return "BANK_TRANSFER";
    }
    
    @Override
    public double getProcessingFee(BigDecimal amount) {
        // Fixed $5 fee for bank transfers
        return 5.00;
    }
}