package com.boatsafari.managementsystem.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("IT_SUPPORT")
@Data
public class ITSupport extends StaffMember {
    @Column(name = "department")
    private String department;
}