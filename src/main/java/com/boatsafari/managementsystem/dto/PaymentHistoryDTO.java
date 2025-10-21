package com.boatsafari.managementsystem.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentHistoryDTO {
    private Long paymentId;
    private Long bookingId;
    private String customerName;
    private String customerEmail;
    private String customerContact;
    private String paymentMethod;
    private String status;
    private double amount;
    private LocalDateTime paymentDate;
    private String tripName;
    private String tripDate;
    private int passengers;
    
    // Constructor for easy creation from repository queries
    public PaymentHistoryDTO(Long paymentId, Long bookingId, String customerName, String customerEmail,
                           String customerContact, String paymentMethod, String status, double amount,
                           LocalDateTime paymentDate, String tripName, String tripDate, int passengers) {
        this.paymentId = paymentId;
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerContact = customerContact;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.tripName = tripName;
        this.tripDate = tripDate;
        this.passengers = passengers;
    }
}