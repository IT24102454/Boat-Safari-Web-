package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.ITSupport;
import com.boatsafari.managementsystem.repository.ITSupportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for ITSupport-specific operations (e.g., monitoring bookings).
 */
@Service
public class ITSupportService {

    @Autowired
    private ITSupportRepository itSupportRepository;

    public ITSupport saveITSupport(ITSupport itSupport) {
        return itSupportRepository.save(itSupport);
    }

    public List<ITSupport> getAllITSupports() {
        return itSupportRepository.findAll();
    }

    public Optional<ITSupport> getITSupportById(Long id) {
        return itSupportRepository.findById(id);
    }

    public ITSupport updateITSupport(ITSupport itSupport) {
        return itSupportRepository.save(itSupport);
    }

    public void deleteITSupport(Long id) {
        itSupportRepository.deleteById(id);
    }

    // Example: Method for monitoring bookings (from sprint)
    public void monitorBookings() {
        // Logic for real-time monitoring
    }
}