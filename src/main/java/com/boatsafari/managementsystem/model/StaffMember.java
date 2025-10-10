package com.boatsafari.managementsystem.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("STAFF")
@Data
public class StaffMember extends User {
    // No additional fields needed
}