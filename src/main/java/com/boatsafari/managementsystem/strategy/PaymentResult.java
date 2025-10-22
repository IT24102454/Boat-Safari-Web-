package com.boatsafari.managementsystem.strategy;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Payment Result DTO for Strategy Pattern
 */
@Data
@AllArgsConstructor
public class PaymentResult {
    private boolean success;
    private String message;
    private String transactionId;
    private double processingFee;
}