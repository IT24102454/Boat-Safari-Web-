package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.Admin;
import com.boatsafari.managementsystem.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for Admin-specific operations (e.g., managing trips/schedules).
 */
@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public Admin saveAdmin(Admin admin) {
        // Validate hire date, etc.
        return adminRepository.save(admin);
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Admin updateAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }

    // Example: Admin-specific method for managing trips (delegate to TripService if needed)
    public void manageTrips() {
        // Logic for creating/updating trips
    }
}