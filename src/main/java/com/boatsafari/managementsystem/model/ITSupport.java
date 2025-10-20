package com.boatsafari.managementsystem.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("IT_SUPPORT")
@Data
@EqualsAndHashCode(callSuper = true)
public class ITSupport extends StaffMember {
    @Column(name = "department")
    private String department;
}