// src/main/java/com/boatsafari/managementsystem/repository/BoatRepository.java
package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Boat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoatRepository extends JpaRepository<Boat, Long> {
}