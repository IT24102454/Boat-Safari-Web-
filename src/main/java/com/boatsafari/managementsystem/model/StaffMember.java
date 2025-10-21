package com.boatsafari.managementsystem.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("STAFF")
@Data
@EqualsAndHashCode(callSuper = true)
public class StaffMember extends User {
    // No additional fields needed
}