package com.boatsafari.managementsystem.strategy;

import java.math.BigDecimal;

/**
 * Strategy Pattern Implementation for Payment Processing
 * This follows the Strategy design pattern learned in class
 */
public interface PaymentStrategy {
    PaymentResult processPayment(BigDecimal amount, String customerEmail, String paymentDetails);
    boolean validatePaymentDetails(String paymentDetails);
    String getPaymentMethodName();
    double getProcessingFee(BigDecimal amount);
}