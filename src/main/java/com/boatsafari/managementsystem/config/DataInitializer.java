package com.boatsafari.managementsystem.config;

import com.boatsafari.managementsystem.model.SafariGuide;
import com.boatsafari.managementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.init.enabled:false}")
    private boolean initEnabled;

    @Override
    public void run(String... args) {
        if (!initEnabled) {
            return; // Initialization disabled by default
        }
        initializeGuideUser();
    }

    private void initializeGuideUser() {
        // Check if guide user already exists
        if (userRepository.findByEmail("guide@gmail.com") != null) {
            System.out.println("Guide user already exists, skipping creation.");
            return;
        }

        // Create guide user
        SafariGuide guide = new SafariGuide();
        guide.setFirstName("Safari");
        guide.setSecondName("Guide");
        guide.setEmail("guide@gmail.com");
        guide.setPassword(passwordEncoder.encode("guideguide"));
        guide.setContactNo("123-456-7890");
        guide.setAddress("Safari Office");
        guide.setCity("Mombasa");
        guide.setStreet("Marine Drive");
        guide.setPostalCode("80100");
        guide.setHireDate("2023-01-15");
        guide.setCertification("Certified Marine Guide");
        guide.setYearsOfExperience(5);
        guide.setSpecialization("Marine Wildlife");

        userRepository.save(guide);
        System.out.println("Guide user created successfully with email: guide@gmail.com");
    }
}
