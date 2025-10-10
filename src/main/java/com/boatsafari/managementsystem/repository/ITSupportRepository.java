package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.ITSupport;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for ITSupport entity (subtype of StaffMember/User).
 */
public interface ITSupportRepository extends JpaRepository<ITSupport, Long> {
    // Custom methods can be added here if needed
}