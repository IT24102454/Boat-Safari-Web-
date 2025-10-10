package com.boatsafari.managementsystem.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("CUSTOMER")
@Data
public class Customer extends User {
    // No additional fields needed based on DB
}