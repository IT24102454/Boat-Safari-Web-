// src/main/java/com/boatsafari/managementsystem/model/SupportTicket.java
package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "SupportTickets")
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    private String name;
    private String email;
    private String phone;
    private String subject;

    @Column(length = 4000)
    private String message;

    // NEW, OPEN, RESOLVED
    private String status;

    private String preferredContact; // email | phone
    private LocalDateTime createdAt;
}