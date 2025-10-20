package com.boatsafari.managementsystem.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("CUSTOMER")
@Data
@EqualsAndHashCode(callSuper = true)
public class Customer extends User {
    // No additional fields needed based on DB
}