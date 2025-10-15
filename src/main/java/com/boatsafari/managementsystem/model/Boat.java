package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "boat") // Changed from "Boats" to "boat" for consistency
public class Boat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "boat_id")
    private Long boatId;

    @Column(name = "boat_name")
    private String boatName;

    @Column(name = "model")
    private String model;

    @Column(name = "features")
    private String features; // TEXT in DB, but String works for JPA

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "status")
    private String status;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "type")
    private String type;
}