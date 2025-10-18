package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "Feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "rating")
    private Integer rating; // 1-5 stars, nullable for general feedback

    @Column(name = "comments", length = 2000)
    private String comments;

    @Column(name = "experience", length = 2000)
    private String experience; // User's detailed experience

    @Column(name = "category", length = 50)
    private String category; // "GENERAL", "SERVICE", "BOOKING", "WEBSITE", "TRIP", "STAFF"

    @Column(name = "is_visible")
    private Boolean isVisible = true; // IT Support can hide feedbacks

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // IT Support reply
    @Column(name = "reply", length = 2000)
    private String reply;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", nullable = true) // User who submitted feedback - nullable for anonymous feedback
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "booking_id") // Optional - can be related to a booking
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "replied_by") // IT Support who replied
    private User repliedBy;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isVisible == null) {
            isVisible = true;
        }
        // Ensure required fields have defaults
        if (category == null || category.trim().isEmpty()) {
            category = "GENERAL";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}