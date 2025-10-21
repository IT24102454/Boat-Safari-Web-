package com.boatsafari.managementsystem.dto;

import lombok.Data;

@Data
public class PaymentStatsDTO {
    private double totalRevenue;
    private long totalPayments;
    private long cardPayments;
    private double cardPaymentAmount;
    private long onArrivalPayments;
    private double onArrivalPaymentAmount;
    private long completedPayments;
    private long pendingPayments;
    private long failedPayments;
    
    public PaymentStatsDTO() {}
    
    public PaymentStatsDTO(double totalRevenue, long totalPayments, long cardPayments, double cardPaymentAmount,
                          long onArrivalPayments, double onArrivalPaymentAmount, long completedPayments,
                          long pendingPayments, long failedPayments) {
        this.totalRevenue = totalRevenue;
        this.totalPayments = totalPayments;
        this.cardPayments = cardPayments;
        this.cardPaymentAmount = cardPaymentAmount;
        this.onArrivalPayments = onArrivalPayments;
        this.onArrivalPaymentAmount = onArrivalPaymentAmount;
        this.completedPayments = completedPayments;
        this.pendingPayments = pendingPayments;
        this.failedPayments = failedPayments;
    }
}