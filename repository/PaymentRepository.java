package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}