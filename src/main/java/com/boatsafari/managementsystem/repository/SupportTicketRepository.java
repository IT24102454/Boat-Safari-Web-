// src/main/java/com/boatsafari/managementsystem/repository/SupportTicketRepository.java
package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> { }