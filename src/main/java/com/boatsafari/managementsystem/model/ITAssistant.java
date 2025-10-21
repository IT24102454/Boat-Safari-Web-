package com.boatsafari.managementsystem.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("IT_ASSISTANT")
@Data
@EqualsAndHashCode(callSuper = true)
public class ITAssistant extends StaffMember {
    // No additional fields needed
}