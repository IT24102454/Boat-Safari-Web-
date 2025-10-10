// src/main/java/com/boatsafari/managementsystem/service/BoatService.java
package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.Boat;
import com.boatsafari.managementsystem.repository.BoatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BoatService {

    @Autowired
    private BoatRepository boatRepository;

    public List<Boat> getAllBoats() {
        return boatRepository.findAll();
    }

    public Optional<Boat> getBoatById(Long id) {
        return boatRepository.findById(id);
    }
}