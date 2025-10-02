package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "boat") // Changed from "Boats" to "boat" for consistency
public class Boat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "boatId")
    private Long boatId;

    @Column(name = "boatName")
    private String boatName;

    @Column(name = "model")
    private String model;

    @Column(name = "features")
    private String features; // TEXT in DB, but String works for JPA

    @Column(name = "registrationNumber")
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