package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedbackId")
    private Long feedbackId;

    @Column(name = "rating")
    private int rating;

    @Column(name = "comments")
    private String comments;

    @ManyToOne
    @JoinColumn(name = "bookingId")
    private Booking booking;
}