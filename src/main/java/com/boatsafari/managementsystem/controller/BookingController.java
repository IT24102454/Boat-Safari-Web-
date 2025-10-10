// src/main/java/com/boatsafari/managementsystem/controller/BookingController.java
package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Booking;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.service.BookingService;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    @Autowired
    public BookingController(BookingService bookingService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.createProvisionalBooking(
                    request.getTripId(),
                    request.getName(),
                    request.getContact(),
                    request.getEmail(),
                    request.getNumberOfPassengers()
            );
            return ResponseEntity
                    .created(URI.create("/api/bookings/" + booking.getBookingId()))
                    .body(booking);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to create booking"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        return booking.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId) {
        try {
            bookingService.confirmBooking(bookingId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to confirm booking"));
        }
    }

    /**
     * Get all bookings (admin functionality)
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update booking (admin functionality)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                
                // Update fields based on actual Booking model
                if (bookingDetails.getName() != null) {
                    booking.setName(bookingDetails.getName());
                }
                if (bookingDetails.getContact() != null) {
                    booking.setContact(bookingDetails.getContact());
                }
                if (bookingDetails.getEmail() != null) {
                    booking.setEmail(bookingDetails.getEmail());
                }
                if (bookingDetails.getPassengers() > 0) {
                    booking.setPassengers(bookingDetails.getPassengers());
                }
                if (bookingDetails.getStatus() != null) {
                    booking.setStatus(bookingDetails.getStatus());
                }
                if (bookingDetails.getTotalCost() > 0) {
                    booking.setTotalCost(bookingDetails.getTotalCost());
                }
                
                Booking updatedBooking = bookingRepository.save(booking);
                return ResponseEntity.ok(updatedBooking);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to update booking: " + e.getMessage()));
        }
    }

    /**
     * Delete booking (admin functionality)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            if (bookingRepository.existsById(id)) {
                bookingRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to delete booking: " + e.getMessage()));
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true) // allows extra fields like travelDate without failing
    public static class BookingRequest {
        private Long tripId;
        private String name;
        private String contact;
        private String email;
        private int numberOfPassengers;
        private String travelDate; // optional; not persisted unless you add it to the entity/DB
    }

    @Data
    public static class ErrorResponse {
        private final String message;
    }
}