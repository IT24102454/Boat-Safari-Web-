// src/main/java/com/boatsafari/managementsystem/service/BookingService.java
package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.Booking;
import com.boatsafari.managementsystem.model.Trip;
import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.repository.TripRepository;
import com.boatsafari.managementsystem.util.CurrentUserUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @Transactional
    public Booking createProvisionalBooking(Long tripId, String name, String contact, String email, int passengers) {
        User user = currentUserUtil.getCurrentUser(); // throws IllegalArgumentException with clear message

        log.info("Create booking: userId={}, tripId={}, name={}, email={}, contact={}, pax={}",
                user.getUserId(), tripId, name, email, contact, passengers);

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (contact == null || contact.trim().isEmpty()) {
            throw new IllegalArgumentException("Contact number is required");
        }
        if (email == null || !Pattern.matches("^[A-Za-z0-9+_.-]+@(.+)$", email)) {
            throw new IllegalArgumentException("Valid email is required");
        }
        if (passengers <= 0) {
            throw new IllegalArgumentException("Number of passengers must be at least 1");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        int bookedSeats = bookingRepository.findByTrip_TripId(tripId).stream()
                .mapToInt(Booking::getPassengers).sum();

        if (bookedSeats + passengers > trip.getCapacity()) {
            int available = Math.max(0, trip.getCapacity() - bookedSeats);
            throw new IllegalArgumentException("Not enough seats available. Available: " + available);
        }

        BigDecimal totalCost = BigDecimal.valueOf(trip.getPrice())
                .multiply(BigDecimal.valueOf(passengers));

        Booking booking = new Booking();
        booking.setName(name);
        booking.setContact(contact);
        booking.setEmail(email);
        booking.setPassengers(passengers);
        booking.setStatus("PROVISIONAL");
        booking.setHoldTimer(LocalDateTime.now().plusMinutes(15));
        booking.setTotalCost(totalCost.doubleValue());
        booking.setCustomer(user);
        booking.setTrip(trip);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking saved: id={}, status={}", saved.getBookingId(), saved.getStatus());
        return saved;
    }

    @Transactional
    public void confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getHoldTimer() != null && booking.getHoldTimer().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Booking has expired");
        }
        if (!"PROVISIONAL".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking is not in PROVISIONAL state");
        }

        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);
        log.info("Booking confirmed: id={}", bookingId);
    }
}