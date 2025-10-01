package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.SafariGuide;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for SafariGuide entity (subtype of StaffMember/User).
 */
public interface SafariGuideRepository extends JpaRepository<SafariGuide, Long> {
    // Custom methods can be added here, e.g.,
    // List<SafariGuide> findByCertification(String certification);
}