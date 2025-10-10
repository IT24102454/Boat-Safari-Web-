package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Admin entity (subtype of User).
 */
public interface AdminRepository extends JpaRepository<Admin, Long> {
    // Custom methods can be added here, e.g.,
    // List<Admin> findByHireDateAfter(LocalDate date);
}