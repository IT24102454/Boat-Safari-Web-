package com.boatsafari.managementsystem.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long bookingId;
    private String method; // "CARD" or "PAY_ON_ARRIVAL"
    private String cardNumber; // required if method=CARD
    private String cardExpiry; // MM/YY required if method=CARD
    private String cardCvv; // 3 digits required if method=CARD
    private String cardHolderName; // required if method=CARD
}