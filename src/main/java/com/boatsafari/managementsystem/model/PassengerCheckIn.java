package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "PassengerCheckIns")
public class PassengerCheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checkInId")
    private Long checkInId;

    @ManyToOne
    @JoinColumn(name = "bookingId", nullable = false)
    private Booking booking;

    @Column(name = "checkedIn", nullable = false)
    private Boolean checkedIn = false;

    @Column(name = "checkInTime")
    private LocalDateTime checkInTime;

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "checkedInBy")
    private SafariGuide checkedInBy;
}
