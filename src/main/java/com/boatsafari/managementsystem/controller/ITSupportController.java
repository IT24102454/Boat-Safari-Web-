package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Booking;
import com.boatsafari.managementsystem.model.Feedback;
import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.service.FeedbackService;
import com.boatsafari.managementsystem.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/itsupport")
@CrossOrigin(origins = "*")
public class ITSupportController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    // ================= Dashboard Overview Endpoints =================

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Booking statistics
            List<Booking> allBookings = bookingRepository.findAll();
            stats.put("totalBookings", allBookings.size());
            stats.put("confirmedBookings", allBookings.stream()
                    .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                    .count());
            stats.put("provisionalBookings", allBookings.stream()
                    .filter(b -> "PROVISIONAL".equalsIgnoreCase(b.getStatus()))
                    .count());
            
            // Feedback statistics
            List<Feedback> allFeedbacks = feedbackService.getAllFeedbacks();
            stats.put("totalFeedbacks", allFeedbacks.size());
            stats.put("pendingFeedbacks", allFeedbacks.stream()
                    .filter(f -> f.getReply() == null || f.getReply().trim().isEmpty())
                    .count());
            stats.put("repliedFeedbacks", allFeedbacks.stream()
                    .filter(f -> f.getReply() != null && !f.getReply().trim().isEmpty())
                    .count());
            
            // Customer statistics
            List<User> allCustomers = userRepository.findAll().stream()
                    .filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole()))
                    .collect(Collectors.toList());
            stats.put("totalCustomers", allCustomers.size());
                    
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve dashboard statistics", "details", e.getMessage()));
        }
    }

    // ================= Booking Management Endpoints =================

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDetailDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customerEmail,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            
            // Apply filters
            List<Booking> filtered = bookings.stream()
                    .filter(b -> status == null || status.equalsIgnoreCase(b.getStatus()))
                    .filter(b -> customerEmail == null || 
                            (b.getCustomer() != null && b.getCustomer().getEmail().toLowerCase()
                                    .contains(customerEmail.toLowerCase())))
                    .filter(b -> customerName == null || 
                            (b.getCustomer() != null && 
                             (b.getCustomer().getFirstName() + " " + b.getCustomer().getSecondName())
                                     .toLowerCase().contains(customerName.toLowerCase())))
                    .filter(b -> tripId == null || 
                            (b.getTrip() != null && Objects.equals(b.getTrip().getTripId(), tripId)))
                    .filter(b -> {
                        if (fromDate == null && toDate == null) return true;
                        LocalDate bookingDate = b.getTrip() != null ? b.getTrip().getDate() : null;
                        if (bookingDate == null) return false;
                        boolean after = fromDate == null || !bookingDate.isBefore(fromDate);
                        boolean before = toDate == null || !bookingDate.isAfter(toDate);
                        return after && before;
                    })
                    .sorted(Comparator.comparing(Booking::getBookingId).reversed())
                    .collect(Collectors.toList());
                    
            // Convert to detailed DTOs
            List<BookingDetailDTO> detailedBookings = filtered.stream()
                    .map(this::toDetailedBookingDTO)
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok(detailedBookings);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBookingDetails(@PathVariable Long id) {
        try {
            Optional<Booking> booking = bookingRepository.findById(id);
            if (booking.isPresent()) {
                BookingDetailDTO detailedBooking = toDetailedBookingDTO(booking.get());
                return ResponseEntity.ok(detailedBooking);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve booking details"));
        }
    }

    @GetMapping("/customers/{customerId}/bookings")
    public ResponseEntity<List<BookingDetailDTO>> getCustomerBookings(@PathVariable Long customerId) {
        try {
            List<Booking> customerBookings = bookingRepository.findAll().stream()
                    .filter(b -> b.getCustomer() != null && Objects.equals(b.getCustomer().getUserId(), customerId))
                    .sorted(Comparator.comparing(Booking::getBookingId).reversed())
                    .collect(Collectors.toList());
                    
            List<BookingDetailDTO> detailedBookings = customerBookings.stream()
                    .map(this::toDetailedBookingDTO)
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok(detailedBookings);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ================= Customer Management Endpoints =================

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerDetailDTO>> getAllCustomers(
            @RequestParam(required = false) String search
    ) {
        try {
            List<User> customers = userRepository.findAll().stream()
                    .filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole()))
                    .collect(Collectors.toList());
            
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase();
                customers = customers.stream()
                        .filter(c -> c.getFirstName().toLowerCase().contains(searchLower) ||
                                   c.getSecondName().toLowerCase().contains(searchLower) ||
                                   c.getEmail().toLowerCase().contains(searchLower))
                        .collect(Collectors.toList());
            }
                    
            List<CustomerDetailDTO> customerDetails = customers.stream()
                    .map(this::toCustomerDetailDTO)
                    .sorted(Comparator.comparing(CustomerDetailDTO::getLastName)
                            .thenComparing(CustomerDetailDTO::getFirstName))
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok(customerDetails);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<?> getCustomerDetails(@PathVariable Long id) {
        try {
            Optional<User> customer = userRepository.findById(id);
            if (customer.isPresent() && "CUSTOMER".equalsIgnoreCase(customer.get().getRole())) {
                CustomerDetailDTO customerDetail = toCustomerDetailDTO(customer.get());
                return ResponseEntity.ok(customerDetail);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve customer details"));
        }
    }

    // ================= Feedback Management Endpoints =================

    @GetMapping("/feedback")
    public ResponseEntity<List<FeedbackDetailDTO>> getAllFeedback(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating
    ) {
        try {
            List<Feedback> feedbacks = feedbackService.getAllFeedbacks();
            
            // Apply filters
            List<Feedback> filtered = feedbacks.stream()
                    .filter(f -> {
                        if (status == null) return true;
                        boolean hasReply = f.getReply() != null && !f.getReply().trim().isEmpty();
                        return ("pending".equalsIgnoreCase(status) && !hasReply) ||
                               ("replied".equalsIgnoreCase(status) && hasReply);
                    })
                    .filter(f -> category == null || category.equalsIgnoreCase(f.getCategory()))
                    .filter(f -> minRating == null || f.getRating() >= minRating)
                    .filter(f -> maxRating == null || f.getRating() <= maxRating)
                    .sorted(Comparator.comparing(Feedback::getCreatedAt).reversed())
                    .collect(Collectors.toList());
                    
            List<FeedbackDetailDTO> detailedFeedbacks = filtered.stream()
                    .map(this::toFeedbackDetailDTO)
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok(detailedFeedbacks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/feedback/{id}")
    public ResponseEntity<?> getFeedbackDetails(@PathVariable Long id) {
        try {
            Optional<Feedback> feedback = feedbackService.getFeedbackById(id);
            if (feedback.isPresent()) {
                FeedbackDetailDTO detailedFeedback = toFeedbackDetailDTO(feedback.get());
                return ResponseEntity.ok(detailedFeedback);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve feedback details"));
        }
    }

    @PostMapping("/feedback/{id}/reply")
    public ResponseEntity<?> replyToFeedback(@PathVariable Long id, @RequestBody ReplyRequest request) {
        try {
            Feedback feedback = feedbackService.replyToFeedback(id, request.getReply());
            FeedbackDetailDTO detailedFeedback = toFeedbackDetailDTO(feedback);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Reply submitted successfully",
                    "feedback", detailedFeedback
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to submit reply", "details", e.getMessage()));
        }
    }

    @GetMapping("/customers/{customerId}/feedback")
    public ResponseEntity<List<FeedbackDetailDTO>> getCustomerFeedback(@PathVariable Long customerId) {
        try {
            List<Feedback> customerFeedbacks = feedbackService.getFeedbacksByUserId(customerId);
            List<FeedbackDetailDTO> detailedFeedbacks = customerFeedbacks.stream()
                    .map(this::toFeedbackDetailDTO)
                    .sorted(Comparator.comparing(FeedbackDetailDTO::getCreatedAt).reversed())
                    .collect(Collectors.toList());
                    
            return ResponseEntity.ok(detailedFeedbacks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ================= Helper Methods and DTOs =================

    private BookingDetailDTO toDetailedBookingDTO(Booking booking) {
        BookingDetailDTO dto = new BookingDetailDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setStatus(booking.getStatus());
        dto.setNumberOfPassengers(booking.getPassengers());
        dto.setBookingDate(LocalDateTime.now()); // Booking date not stored in model, using current time
        
        if (booking.getCustomer() != null) {
            dto.setCustomerId(booking.getCustomer().getUserId());
            dto.setCustomerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getSecondName());
            dto.setCustomerEmail(booking.getCustomer().getEmail());
            dto.setCustomerPhone(booking.getCustomer().getContactNo());
        }
        
        if (booking.getTrip() != null) {
            dto.setTripId(booking.getTrip().getTripId());
            dto.setTripName(booking.getTrip().getName());
            dto.setTripDate(booking.getTrip().getDate());
            dto.setTripLocation(booking.getTrip().getLocation());
            dto.setTripPrice(booking.getTrip().getPrice());
            
            if (booking.getTrip().getBoat() != null) {
                dto.setBoatName(booking.getTrip().getBoat().getBoatName());
                dto.setBoatCapacity(booking.getTrip().getBoat().getCapacity());
            }
            
            if (booking.getTrip().getGuide() != null) {
                dto.setGuideName(booking.getTrip().getGuide().getFirstName() + " " + 
                               booking.getTrip().getGuide().getSecondName());
            }
        }
        
        return dto;
    }

    private CustomerDetailDTO toCustomerDetailDTO(User customer) {
        CustomerDetailDTO dto = new CustomerDetailDTO();
        dto.setCustomerId(customer.getUserId());
        dto.setFirstName(customer.getFirstName() != null ? customer.getFirstName() : "");
        dto.setLastName(customer.getSecondName() != null ? customer.getSecondName() : "");
        dto.setEmail(customer.getEmail() != null ? customer.getEmail() : "");
        dto.setPhone(customer.getContactNo() != null ? customer.getContactNo() : "");
        dto.setRegistrationDate(LocalDateTime.now()); // Registration date not in model, using current time
        
        // Count bookings for this customer
        long bookingCount = bookingRepository.findAll().stream()
                .filter(b -> b.getCustomer() != null && 
                           Objects.equals(b.getCustomer().getUserId(), customer.getUserId()))
                .count();
        dto.setTotalBookings(bookingCount);
        
        // Count feedbacks for this customer
        try {
            long feedbackCount = feedbackService.getFeedbacksByUserId(customer.getUserId()).size();
            dto.setTotalFeedbacks(feedbackCount);
        } catch (Exception e) {
            dto.setTotalFeedbacks(0L);
        }
        
        return dto;
    }

    private FeedbackDetailDTO toFeedbackDetailDTO(Feedback feedback) {
        FeedbackDetailDTO dto = new FeedbackDetailDTO();
        dto.setFeedbackId(feedback.getFeedbackId());
        dto.setTitle(feedback.getTitle());
        dto.setComments(feedback.getComments());
        dto.setExperience(feedback.getExperience());
        dto.setCategory(feedback.getCategory());
        dto.setRating(feedback.getRating());
        dto.setReply(feedback.getReply());
        dto.setCreatedAt(feedback.getCreatedAt());
        dto.setIsVisible(feedback.getIsVisible());
        
        if (feedback.getUser() != null) {
            dto.setCustomerId(feedback.getUser().getUserId());
            dto.setCustomerName(feedback.getUser().getFirstName() + " " + feedback.getUser().getSecondName());
            dto.setCustomerEmail(feedback.getUser().getEmail());
        }
        
        if (feedback.getBooking() != null) {
            dto.setRelatedBookingId(feedback.getBooking().getBookingId());
        }
        
        if (feedback.getRepliedBy() != null) {
            dto.setRepliedByName(feedback.getRepliedBy().getFirstName() + " " + 
                               feedback.getRepliedBy().getSecondName());
        }
        
        return dto;
    }

    // ================= DTO Classes =================

    @Data
    public static class BookingDetailDTO {
        private Long bookingId;
        private String status;
        private Integer numberOfPassengers;
        private LocalDateTime bookingDate;
        
        // Customer details
        private Long customerId;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        
        // Trip details
        private Long tripId;
        private String tripName;
        private LocalDate tripDate;
        private String tripLocation;
        private Double tripPrice;
        
        // Boat and Guide details
        private String boatName;
        private Integer boatCapacity;
        private String guideName;
    }

    @Data
    public static class CustomerDetailDTO {
        private Long customerId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDateTime registrationDate;
        private Long totalBookings;
        private Long totalFeedbacks;
    }

    @Data
    public static class FeedbackDetailDTO {
        private Long feedbackId;
        private String title;
        private String comments;
        private String experience;
        private String category;
        private Integer rating;
        private String reply;
        private LocalDateTime createdAt;
        private Boolean isVisible;
        
        // Customer details
        private Long customerId;
        private String customerName;
        private String customerEmail;
        
        // Related booking
        private Long relatedBookingId;
        
        // Reply details
        private String repliedByName;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ReplyRequest {
        private String reply;
    }

    @Data
    public static class ErrorResponse {
        private final String message;
    }
}