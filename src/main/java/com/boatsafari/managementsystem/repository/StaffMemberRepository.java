package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for StaffMember entity (subtype of User; base for ITAssistant, ITSupport, SafariGuide).
 */
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {
    // Custom methods can be added here, e.g.,
    // List<StaffMember> findByHireDateAfter(LocalDate date);
}