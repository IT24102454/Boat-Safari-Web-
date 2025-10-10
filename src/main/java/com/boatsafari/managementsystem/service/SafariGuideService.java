package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.SafariGuide;
import com.boatsafari.managementsystem.repository.SafariGuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for SafariGuide-specific operations (e.g., assignment to trips).
 */
@Service
public class SafariGuideService {

    @Autowired
    private SafariGuideRepository safariGuideRepository;

    public SafariGuide saveSafariGuide(SafariGuide safariGuide) {
        // Validate certification
        return safariGuideRepository.save(safariGuide);
    }

    public List<SafariGuide> getAllSafariGuides() {
        return safariGuideRepository.findAll();
    }

    public Optional<SafariGuide> getSafariGuideById(Long id) {
        return safariGuideRepository.findById(id);
    }

    public SafariGuide updateSafariGuide(SafariGuide safariGuide) {
        return safariGuideRepository.save(safariGuide);
    }

    public void deleteSafariGuide(Long id) {
        safariGuideRepository.deleteById(id);
    }

    // Example: Method for receiving trip assignments (use case #5)
    public void receiveTripAssignment(SafariGuide guide, Long tripId) {
        // Logic to notify guide and update assignment
    }
}