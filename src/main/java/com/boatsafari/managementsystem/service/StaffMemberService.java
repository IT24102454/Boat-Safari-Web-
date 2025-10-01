package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.StaffMember;
import com.boatsafari.managementsystem.repository.StaffMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for StaffMember-specific operations.
 */
@Service
public class StaffMemberService {

    @Autowired
    private StaffMemberRepository staffMemberRepository;

    public StaffMember saveStaffMember(StaffMember staffMember) {
        // Validate hire date
        return staffMemberRepository.save(staffMember);
    }

    public List<StaffMember> getAllStaffMembers() {
        return staffMemberRepository.findAll();
    }

    public Optional<StaffMember> getStaffMemberById(Long id) {
        return staffMemberRepository.findById(id);
    }

    public StaffMember updateStaffMember(StaffMember staffMember) {
        return staffMemberRepository.save(staffMember);
    }

    public void deleteStaffMember(Long id) {
        staffMemberRepository.deleteById(id);
    }
}