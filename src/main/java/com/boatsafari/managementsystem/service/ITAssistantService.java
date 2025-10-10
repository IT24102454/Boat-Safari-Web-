package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.ITAssistant;
import com.boatsafari.managementsystem.repository.ITAssistantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for ITAssistant-specific operations (e.g., updating schedules).
 */
@Service
public class ITAssistantService {

    @Autowired
    private ITAssistantRepository itAssistantRepository;

    public ITAssistant saveITAssistant(ITAssistant itAssistant) {
        return itAssistantRepository.save(itAssistant);
    }

    public List<ITAssistant> getAllITAssistants() {
        return itAssistantRepository.findAll();
    }

    public Optional<ITAssistant> getITAssistantById(Long id) {
        return itAssistantRepository.findById(id);
    }

    public ITAssistant updateITAssistant(ITAssistant itAssistant) {
        return itAssistantRepository.save(itAssistant);
    }

    public void deleteITAssistant(Long id) {
        itAssistantRepository.deleteById(id);
    }

    // Example: Method for updating boat schedules (from sprint)
    public void updateBoatSchedule() {
        // Logic here
    }
}