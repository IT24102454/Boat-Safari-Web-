package com.boatsafari.managementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PaymentAdminDTO {
    private Long paymentId;
    private Long bookingId;
    private String customerName;
    private String customerEmail;
    private String paymentMethod;
    private String status;
    private double amount;
    private LocalDateTime paymentDate;
}
