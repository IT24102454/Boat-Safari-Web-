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

    // NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private String status;

    private String preferredContact; // email | phone
    private LocalDateTime createdAt;
    
    // Support Reply Fields
    @Column(length = 4000)
    private String reply;
    
    private String assignedTo; // IT support person's email/name
    private LocalDateTime repliedAt;
    private LocalDateTime updatedAt;
    
    // Priority: LOW, MEDIUM, HIGH, URGENT
    private String priority;
    
    // Category for better organization
    private String category; // BOOKING, PAYMENT, TECHNICAL, GENERAL
}