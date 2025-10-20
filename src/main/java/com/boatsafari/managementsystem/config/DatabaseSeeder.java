package com.boatsafari.managementsystem.config;

import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Database seeder to populate the database with predefined users for each role
 * This component runs automatically when the application starts
 */
@Component
@ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true", matchIfMissing = false)
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if we already have users in the database
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded, skipping seeding process");
            return;
        }

        System.out.println("Starting database seeding process...");

        // Create 3 Admin users
        createUser("admin1", "Admin", "One", "admin1@boatsafari.com", "123 Main St", "Colombo", "Central", "10100", "0711234567", "5 years experience", "2020-01-15", Admin.class);
        createUser("admin2", "Admin", "Two", "admin2@boatsafari.com", "456 Oak Ave", "Kandy", "Central", "20000", "0722345678", "7 years experience", "2018-05-20", Admin.class);
        createUser("admin3", "Admin", "Three", "admin3@boatsafari.com", "789 Pine Blvd", "Galle", "Southern", "80000", "0733456789", "3 years experience", "2022-03-10", Admin.class);

        // Create 3 Staff Members
        createUser("staff1", "Staff", "One", "staff1@boatsafari.com", "101 Lake Rd", "Colombo", "Western", "10200", "0744567890", "2 years experience", "2023-07-15", StaffMember.class);
        createUser("staff2", "Staff", "Two", "staff2@boatsafari.com", "202 Hill St", "Nuwara Eliya", "Central", "22200", "0755678901", "1 year experience", "2024-02-28", StaffMember.class);
        createUser("staff3", "Staff", "Three", "staff3@boatsafari.com", "303 River Ln", "Jaffna", "Northern", "40000", "0766789012", "4 years experience", "2021-09-05", StaffMember.class);

        // Create 3 Safari Guides
        createUser("guide1", "Guide", "One", "guide1@boatsafari.com", "404 Beach Rd", "Trincomalee", "Eastern", "31000", "0777890123", "Marine Biology Certification", "2022-04-12", SafariGuide.class);
        createUser("guide2", "Guide", "Two", "guide2@boatsafari.com", "505 Coral Ct", "Batticaloa", "Eastern", "30000", "0788901234", "Wildlife Conservation Certificate", "2021-06-30", SafariGuide.class);
        createUser("guide3", "Guide", "Three", "guide3@boatsafari.com", "606 Sea View", "Mirissa", "Southern", "81700", "0799012345", "Dive Master Certification", "2023-01-15", SafariGuide.class);

        // Create 3 IT Support staff
        createUser("support1", "Support", "One", "support1@boatsafari.com", "707 Tech Ave", "Colombo", "Western", "10300", "0710123456", "CompTIA A+ Certification", "2022-08-01", ITSupport.class);
        createUser("support2", "Support", "Two", "support2@boatsafari.com", "808 Code St", "Kandy", "Central", "20100", "0721234567", "Microsoft Certified", "2023-05-15", ITSupport.class);
        createUser("support3", "Support", "Three", "support3@boatsafari.com", "909 Server Ln", "Galle", "Southern", "80100", "0732345678", "ITIL Foundation", "2021-11-20", ITSupport.class);

        // Create 3 IT Assistants
        createUser("assistant1", "Assistant", "One", "assistant1@boatsafari.com", "111 Help St", "Colombo", "Western", "10400", "0743456789", "Computer Science Degree", "2024-03-10", ITAssistant.class);
        createUser("assistant2", "Assistant", "Two", "assistant2@boatsafari.com", "222 Desk Ave", "Matara", "Southern", "81000", "0754567890", "Help Desk Experience", "2023-09-22", ITAssistant.class);
        createUser("assistant3", "Assistant", "Three", "assistant3@boatsafari.com", "333 Support Rd", "Negombo", "Western", "11500", "0765678901", "IT Diploma", "2022-12-05", ITAssistant.class);

        // Create 3 Customers
        createUser("customer1", "Customer", "One", "customer1@example.com", "444 Beach Rd", "Colombo", "Western", "10500", "0776789012", "", "2025-01-01", Customer.class);
        createUser("customer2", "Customer", "Two", "customer2@example.com", "555 Palm St", "Kandy", "Central", "20200", "0787890123", "", "2025-02-15", Customer.class);
        createUser("customer3", "Customer", "Three", "customer3@example.com", "666 Island Ave", "Jaffna", "Northern", "40100", "0798901234", "", "2025-03-20", Customer.class);

        System.out.println("Database seeding completed successfully!");
    }

    private <T extends User> void createUser(String password, String firstName, String secondName, String email,
                                          String address, String city, String street, String postalCode,
                                          String contactNo, String certification, String hireDate, Class<T> userClass) {
        try {
            T user = userClass.getDeclaredConstructor().newInstance();
            user.setFirstName(firstName);
            user.setSecondName(secondName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setAddress(address);
            user.setCity(city);
            user.setStreet(street);
            user.setPostalCode(postalCode);
            user.setContactNo(contactNo);
            user.setCertification(certification);
            user.setHireDate(hireDate);

            userRepository.save(user);
            System.out.println("Created " + userClass.getSimpleName() + ": " + firstName + " " + secondName);
        } catch (Exception e) {
            System.err.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
