package com.boatsafari.managementsystem.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("IT_ASSISTANT")
@Data
public class ITAssistant extends StaffMember {
    // No additional fields needed
}