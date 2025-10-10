package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "Trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tripId")
    private Long tripId;

    @Column(name = "name")
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "startTime")
    private LocalTime startTime;

    @Column(name = "endTime")
    private LocalTime endTime;

    @Column(name = "duration")
    private int duration;

    @Column(name = "capacity")
    private int capacity;

    @Column(name = "price")
    private double price;

    @Column(name = "location")
    private String location;

    @Column(name = "route")
    private String route;

    @Column(name = "imageUrl")
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "boatId")
    private Boat boat;

    @ManyToOne
    @JoinColumn(name = "guideId")
    private SafariGuide guide;
}