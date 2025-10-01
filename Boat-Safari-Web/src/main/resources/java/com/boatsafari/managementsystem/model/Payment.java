package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "Payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paymentId")
    private Long paymentId;

    @Column(name = "paymentMethod")
    private String paymentMethod;

    @Column(name = "paymentDate")
    private LocalDateTime paymentDate;

    @Column(name = "amount")
    private double amount;

    @Column(name = "status")
    private String status;

    // Added via ALTER
    @Column(name = "cardNumber")
    private String cardNumber;

    @Column(name = "cardExpiry")
    private String cardExpiry;

    @Column(name = "cardCvv")
    private String cardCvv;

    @Column(name = "cardHolderName")
    private String cardHolderName;
}