package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for general User operations (applies to all subtypes).
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Get a user by email
     * @param email The email to search for
     * @return The user with the given email, or null if not found
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(User user) {
        // Validate and update (e.g., check if exists)
        return userRepository.save(user);
    }

    /**
     * Change a user's password
     * @param userId The ID of the user
     * @param newPassword The new password (will be encoded)
     */
    public void changePassword(Long userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Assigns a new role to a user, which may change the user's type
     *
     * @param userId ID of the user to update
     * @param newRole The new role to assign
     * @return The updated user with the new role
     */
    @Transactional
    public User assignRole(Long userId, Role newRole) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        User existingUser = userOpt.get();
        System.out.println("Assigning role " + newRole + " to user " + existingUser.getFirstName());

        // Create a new user instance of the appropriate type based on the role
        User updatedUser;
        switch (newRole) {
            case ADMIN:
                updatedUser = new Admin();
                break;
            case STAFF:
                updatedUser = new StaffMember();
                break;
            case IT_ASSISTANT:
                updatedUser = new ITAssistant();
                break;
            case IT_SUPPORT:
                updatedUser = new ITSupport();
                break;
            case GUIDE:
                updatedUser = new SafariGuide();
                break;
            case CAPTAIN:
                // Handle captain role - create appropriate user type
                updatedUser = new StaffMember(); // You might want to create a Captain class
                break;
            case CUSTOMER:
                updatedUser = new Customer();
                break;
            default:
                throw new RuntimeException("Unsupported role: " + newRole);
        }

        // Copy all properties from existing user to the new user instance
        updatedUser.setUserId(existingUser.getUserId());
        updatedUser.setFirstName(existingUser.getFirstName());
        updatedUser.setSecondName(existingUser.getSecondName());
        updatedUser.setPassword(existingUser.getPassword());
        updatedUser.setEmail(existingUser.getEmail());
        updatedUser.setContactNo(existingUser.getContactNo());
        updatedUser.setAddress(existingUser.getAddress());
        updatedUser.setCity(existingUser.getCity());
        updatedUser.setStreet(existingUser.getStreet());
        updatedUser.setPostalCode(existingUser.getPostalCode());
        updatedUser.setHireDate(existingUser.getHireDate());
        updatedUser.setCertification(existingUser.getCertification());

        // Save the user with the new type/role
        try {
            return userRepository.save(updatedUser);
        } catch (Exception e) {
            System.err.println("Error saving user with new role: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update user role: " + e.getMessage(), e);
        }
    }
}