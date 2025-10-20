package com.boatsafari.managementsystem.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("SAFARI_GUIDE")
@Data
@EqualsAndHashCode(callSuper = true)
public class SafariGuide extends StaffMember {
    // certification is already in base User

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "specialization", length = 100)
    private String specialization;
}