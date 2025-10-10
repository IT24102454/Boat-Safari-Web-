package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for Customer entity (subtype of User).
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    /**
     * Finds a customer by their email address.
     * @param email the email to search for
     * @return Optional containing the Customer entity if found
     */
    Optional<Customer> findByEmail(String email);
}