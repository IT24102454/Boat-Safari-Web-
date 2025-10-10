package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.SafariGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for SafariGuide entity (subtype of StaffMember/User).
 */
@Repository
public interface SafariGuideRepository extends JpaRepository<SafariGuide, Long> {
    Optional<SafariGuide> findByEmail(String email);
    Optional<SafariGuide> findByUserId(Long userId);
}