// src/main/java/com/boatsafari/managementsystem/config/DataSeeder.java
package com.boatsafari.managementsystem.config;

import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.repository.BoatRepository;
import com.boatsafari.managementsystem.repository.UserRepository;
import com.boatsafari.managementsystem.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Configuration
@ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true", matchIfMissing = false)
public class DataSeeder {

    @Autowired
    private TripService tripService;

    @Autowired
    private BoatRepository boatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true", matchIfMissing = false)
    CommandLineRunner initDatabase() {
        return args -> {
            // Seed admin user if not exists
            if (userRepository.findByEmail("admin@gmail.com") == null) {
                Admin admin = new Admin();
                admin.setEmail("admin@gmail.com");
                admin.setPassword(passwordEncoder.encode("adminadmin"));
                admin.setFirstName("Admin");
                admin.setSecondName("User");
                admin.setContactNo("1234567890");
                admin.setAddress("Admin Office");
                admin.setCity("Admin City");
                admin.setStreet("Main Street");
                admin.setPostalCode("12345");
                admin.setHireDate(LocalDate.now().toString());
                userRepository.save(admin);
                System.out.println("Admin user created");
            }

            // Seed staff members if none exist
            if (userRepository.findByEmail("staff@gmail.com") == null) {
                StaffMember staffMember = new StaffMember();
                staffMember.setEmail("staff@gmail.com");
                staffMember.setPassword(passwordEncoder.encode("staffstaff"));
                staffMember.setFirstName("Staff");
                staffMember.setSecondName("Member");
                staffMember.setContactNo("1234567891");
                staffMember.setAddress("Staff Office");
                staffMember.setCity("Staff City");
                staffMember.setStreet("Staff Street");
                staffMember.setPostalCode("12346");
                staffMember.setHireDate(LocalDate.now().minusMonths(3).toString());
                staffMember.setCertification("Staff Management Certificate");
                userRepository.save(staffMember);
                System.out.println("Staff member created");
            }

            // Seed Safari Guide if none exist
            if (userRepository.findByEmail("guide@gmail.com") == null) {
                SafariGuide guide = new SafariGuide();
                guide.setEmail("guide@gmail.com");
                guide.setPassword(passwordEncoder.encode("guideguide"));
                guide.setFirstName("Safari");
                guide.setSecondName("Guide");
                guide.setContactNo("1234567892");
                guide.setAddress("Guide Office");
                guide.setCity("Guide City");
                guide.setStreet("Guide Street");
                guide.setPostalCode("12347");
                guide.setHireDate(LocalDate.now().minusMonths(6).toString());
                guide.setCertification("Wildlife Guide Certificate");
                guide.setYearsOfExperience(5);
                guide.setSpecialization("Marine Wildlife");
                userRepository.save(guide);
                System.out.println("Safari guide created");
            }

            // Seed IT Support if none exist
            if (userRepository.findByEmail("support@gmail.com") == null) {
                ITSupport support = new ITSupport();
                support.setEmail("support@gmail.com");
                support.setPassword(passwordEncoder.encode("supportsupport"));
                support.setFirstName("IT");
                support.setSecondName("Support");
                support.setContactNo("1234567893");
                support.setAddress("IT Office");
                support.setCity("IT City");
                support.setStreet("IT Street");
                support.setPostalCode("12348");
                support.setHireDate(LocalDate.now().minusMonths(2).toString());
                support.setCertification("IT Support Certificate");
                support.setDepartment("Customer Support");
                userRepository.save(support);
                System.out.println("IT Support created");
            }

            // Seed boats if none exist
            if (boatRepository.count() == 0) {
                // Boat 1
                Boat boat1 = new Boat();
                boat1.setBoatName("Sea Explorer");
                boat1.setCapacity(20);
                boat1.setDescription("Comfortable boat for wildlife viewing with covered seating area");
                boat1.setType("Safari Cruiser");
                boat1.setStatus("Available");
                boatRepository.save(boat1);

                // Boat 2
                Boat boat2 = new Boat();
                boat2.setBoatName("Ocean Voyager");
                boat2.setCapacity(15);
                boat2.setDescription("Fast speedboat ideal for dolphin watching and short safaris");
                boat2.setType("Speed Boat");
                boat2.setStatus("Available");
                boatRepository.save(boat2);

                // Boat 3
                Boat boat3 = new Boat();
                boat3.setBoatName("Coral Diver");
                boat3.setCapacity(10);
                boat3.setDescription("Small boat perfect for intimate safari experiences and coral reef exploration");
                boat3.setType("Diving Boat");
                boat3.setStatus("Maintenance");
                boatRepository.save(boat3);

                // Boat 4
                Boat boat4 = new Boat();
                boat4.setBoatName("Whale Watcher");
                boat4.setCapacity(30);
                boat4.setDescription("Large vessel with observation deck for whale and dolphin watching");
                boat4.setType("Safari Cruiser");
                boat4.setStatus("Available");
                boatRepository.save(boat4);

                System.out.println("Boats created");
            }

            // Seed trips if none exist
            if (tripService.getAllTrips().isEmpty()) {
                List<Boat> boats = boatRepository.findAll();

                if (!boats.isEmpty()) {
                    // Trip 1 - Morning Dolphin Safari
                    Trip trip1 = new Trip();
                    trip1.setName("Morning Dolphin Safari");
                    trip1.setDescription("Exciting morning trip to spot dolphins in their natural habitat");
                    trip1.setPrice(50.00);
                    trip1.setDuration(3);
                    trip1.setLocation("Coastal Waters");
                    trip1.setBoat(boats.get(0)); // First boat
                    trip1.setImageUrl("/img/trip1.jpg");
                    trip1.setDate(LocalDate.now().plusDays(1)); // Tomorrow
                    trip1.setStartTime(LocalTime.of(7, 0));
                    trip1.setEndTime(LocalTime.of(10, 0));
                    tripService.createTrip(trip1);

                    // Trip 2 - Sunset Whale Watching
                    Trip trip2 = new Trip();
                    trip2.setName("Sunset Whale Watching");
                    trip2.setDescription("Spectacular evening safari to observe whales while enjoying the sunset");
                    trip2.setPrice(75.00);
                    trip2.setDuration(4);
                    trip2.setLocation("Deep Sea");
                    trip2.setBoat(boats.get(3)); // Fourth boat (Whale Watcher)
                    trip2.setImageUrl("/img/trip2.jpg");
                    trip2.setDate(LocalDate.now().plusDays(2)); // Day after tomorrow
                    trip2.setStartTime(LocalTime.of(16, 0));
                    trip2.setEndTime(LocalTime.of(20, 0));
                    tripService.createTrip(trip2);

                    // Trip 3 - Coral Reef Exploration
                    Trip trip3 = new Trip();
                    trip3.setName("Coral Reef Exploration");
                    trip3.setDescription("Discover vibrant coral reefs and colorful marine life");
                    trip3.setPrice(60.00);
                    trip3.setDuration(3);
                    trip3.setLocation("Coral Bay");
                    trip3.setBoat(boats.get(2)); // Third boat (Coral Diver)
                    trip3.setImageUrl("/img/trip3.webp");
                    trip3.setDate(LocalDate.now().plusDays(3));
                    trip3.setStartTime(LocalTime.of(10, 0));
                    trip3.setEndTime(LocalTime.of(13, 0));
                    tripService.createTrip(trip3);

                    // Trip 4 - Full-Day Marine Adventure
                    Trip trip4 = new Trip();
                    trip4.setName("Full-Day Marine Adventure");
                    trip4.setDescription("Comprehensive safari covering multiple marine habitats and wildlife");
                    trip4.setPrice(120.00);
                    trip4.setDuration(8);
                    trip4.setLocation("Various Locations");
                    trip4.setBoat(boats.get(0)); // First boat
                    trip4.setImageUrl("/img/trip4.jpg");
                    trip4.setDate(LocalDate.now().plusDays(5));
                    trip4.setStartTime(LocalTime.of(9, 0));
                    trip4.setEndTime(LocalTime.of(17, 0));
                    tripService.createTrip(trip4);

                    // Trip 5 - Family Safari Experience
                    Trip trip5 = new Trip();
                    trip5.setName("Family Safari Experience");
                    trip5.setDescription("Kid-friendly safari with educational content about marine life");
                    trip5.setPrice(80.00);
                    trip5.setDuration(4);
                    trip5.setLocation("Sheltered Bay");
                    trip5.setBoat(boats.get(1)); // Second boat (Ocean Voyager)
                    trip5.setImageUrl("/img/trip5.jpg");
                    trip5.setDate(LocalDate.now().plusDays(7));
                    trip5.setStartTime(LocalTime.of(13, 0));
                    trip5.setEndTime(LocalTime.of(17, 0));
                    tripService.createTrip(trip5);

                    System.out.println("Trips created");
                }
            }
        };
    }
}