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
        // Create a Customer instance instead of generic User
        Customer customer = new Customer();
        customer.setFirstName(user.getFirstName());
        customer.setSecondName(user.getSecondName());
        customer.setEmail(user.getEmail());
        customer.setPassword(passwordEncoder.encode(user.getPassword()));
        customer.setContactNo(user.getContactNo());
        customer.setAddress(user.getAddress());
        customer.setCity(user.getCity());
        customer.setStreet(user.getStreet());
        customer.setPostalCode(user.getPostalCode());
        
        return userRepository.save(customer);
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
     * Update user role by creating a new entity of the correct type
     * This is necessary because of JPA discriminator column constraints
     */
    @Transactional
    public User updateUserRole(Long userId, String newRole) {
        System.out.println("=== ROLE UPDATE START ===");
        System.out.println("User ID: " + userId);
        System.out.println("New Role: " + newRole);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        User existingUser = userOpt.get();
        System.out.println("Found existing user: " + existingUser.getFirstName() + " " + existingUser.getSecondName());
        System.out.println("Current role: " + existingUser.getRole());
        
        // If the role is the same, just return the existing user
        if (newRole.equals(existingUser.getRole())) {
            System.out.println("Role is the same, returning existing user");
            return existingUser;
        }

        // Store user data before deletion
        String firstName = existingUser.getFirstName();
        String secondName = existingUser.getSecondName();
        String password = existingUser.getPassword();
        String email = existingUser.getEmail();
        String contactNo = existingUser.getContactNo();
        String address = existingUser.getAddress();
        String city = existingUser.getCity();
        String street = existingUser.getStreet();
        String postalCode = existingUser.getPostalCode();
        String hireDate = existingUser.getHireDate();
        String certification = existingUser.getCertification();

        // Delete the existing user first
        System.out.println("Deleting existing user...");
        userRepository.delete(existingUser);
        userRepository.flush(); // Ensure deletion is committed
        System.out.println("User deleted successfully");

        // Create new user instance based on the new role
        System.out.println("Creating new user with role: " + newRole);
        User newUser = createUserByRole(newRole);
        System.out.println("New user instance created: " + newUser.getClass().getSimpleName());
        
        // Copy all properties to new user (let database generate new ID)
        newUser.setFirstName(firstName);
        newUser.setSecondName(secondName);
        newUser.setPassword(password);
        newUser.setEmail(email);
        newUser.setContactNo(contactNo);
        newUser.setAddress(address);
        newUser.setCity(city);
        newUser.setStreet(street);
        newUser.setPostalCode(postalCode);
        newUser.setHireDate(hireDate);
        newUser.setCertification(certification);
        
        System.out.println("Saving new user...");
        User savedUser = userRepository.save(newUser);
        System.out.println("New user saved with ID: " + savedUser.getUserId() + " and role: " + savedUser.getRole());
        System.out.println("=== ROLE UPDATE END ===");
        
        return savedUser;
    }

    /**
     * Create a user instance based on role
     */
    private User createUserByRole(String role) {
        switch (role.toUpperCase()) {
            case "ADMIN":
                return new Admin();
            case "CUSTOMER":
                return new Customer();
            case "GUIDE":
            case "SAFARI_GUIDE":
                return new SafariGuide();
            case "IT_ASSISTANT":
                return new ITAssistant();
            case "IT_SUPPORT":
                return new ITSupport();
            case "STAFFMEMBER":
            case "STAFF":
            case "CAPTAIN":
                return new StaffMember();
            default:
                throw new IllegalArgumentException("Invalid role: " + role);
        }
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

    /**
     * Get all safari guides
     * @return List of all SafariGuide users
     */
    public List<SafariGuide> getAllGuides() {
        return userRepository.findAll().stream()
            .filter(user -> user instanceof SafariGuide)
            .map(user -> (SafariGuide) user)
            .toList();
    }

    /**
     * Get a safari guide by ID
     * @param guideId The ID of the guide
     * @return The SafariGuide or null if not found
     */
    public SafariGuide getGuideById(Long guideId) {
        Optional<User> userOpt = userRepository.findById(guideId);
        if (userOpt.isPresent() && userOpt.get() instanceof SafariGuide) {
            return (SafariGuide) userOpt.get();
        }
        return null;
    }
}