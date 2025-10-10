// src/main/java/com/boatsafari/managementsystem/model/Booking.java
package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "Bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookingId")
    private Long bookingId;

    @Column(name = "name")
    private String name;

    @Column(name = "contact")
    private String contact;

    @Column(name = "email")
    private String email;

    @Column(name = "passengers", nullable = false)
    private int passengers;

    @Column(name = "status")
    private String status;

    @Column(name = "holdTimer")
    private LocalDateTime holdTimer;

    @Column(name = "totalCost")
    private double totalCost;

    @ManyToOne
    @JoinColumn(name = "customerId")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "tripId")
    private Trip trip;

    @OneToOne
    @JoinColumn(name = "paymentId")
    private Payment payment;
}