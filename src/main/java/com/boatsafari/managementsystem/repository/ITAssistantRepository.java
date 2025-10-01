package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.ITAssistant;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for ITAssistant entity (subtype of StaffMember/User).
 */
public interface ITAssistantRepository extends JpaRepository<ITAssistant, Long> {
    // Custom methods can be added here if needed
}