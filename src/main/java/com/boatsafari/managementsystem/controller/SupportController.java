// src/main/java/com/boatsafari/managementsystem/controller/SupportController.java
package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Booking;
import com.boatsafari.managementsystem.model.SupportTicket;
import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.repository.SupportTicketRepository;
import com.boatsafari.managementsystem.repository.UserRepository;
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
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Public: customers can send support messages
    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> contact(@RequestBody ContactRequest req) {
        if (isBlank(req.getName()) || isBlank(req.getEmail()) || isBlank(req.getSubject()) || isBlank(req.getMessage())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please fill all required fields."));
        }
        SupportTicket t = new SupportTicket();
        t.setName(req.getName().trim());
        t.setEmail(req.getEmail().trim());
        t.setPhone(opt(req.getPhone()));
        t.setSubject(req.getSubject().trim());
        t.setMessage(req.getMessage().trim());
        t.setPreferredContact(opt(req.getPreferredContact()));
        t.setStatus("NEW");
        t.setCreatedAt(LocalDateTime.now());
        SupportTicket saved = supportTicketRepository.save(t);
        return ResponseEntity.ok(Map.of(
                "message", "Ticket created successfully. Our team will contact you soon.",
                "ticketId", saved.getTicketId()
        ));
    }

    // Public: list IT staff directory (IT_ASSISTANT, IT_SUPPORT)
    @GetMapping("/staff")
    public ResponseEntity<List<StaffDto>> staff() {
        List<User> users = userRepository.findAll();
        List<StaffDto> staff = users.stream()
                .filter(u -> {
                    String r = opt(u.getRole()).toUpperCase(Locale.ROOT);
                    return r.equals("IT_ASSISTANT") || r.equals("IT_SUPPORT");
                })
                .map(u -> new StaffDto(u.getUserId(), fullName(u), u.getEmail(), u.getContactNo(), opt(u.getRole())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(staff);
    }

    // Authenticated: booking history with optional filters
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> bookingHistory(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<Booking> all = bookingRepository.findAll();

        List<Booking> filtered = all.stream()
                .filter(b -> isEmpty(status) || status.equalsIgnoreCase(opt(b.getStatus())))
                .filter(b -> isEmpty(email) || opt(b.getCustomer() != null ? b.getCustomer().getEmail() : "")
                        .toLowerCase(Locale.ROOT).contains(email.toLowerCase(Locale.ROOT)))
                .filter(b -> tripId == null || (b.getTrip() != null && Objects.equals(b.getTrip().getTripId(), tripId)))
                .filter(b -> {
                    if (fromDate == null && toDate == null) return true;
                    LocalDate d = b.getTrip() != null ? b.getTrip().getDate() : null;
                    if (d == null) return false;
                    boolean after = fromDate == null || !d.isBefore(fromDate);
                    boolean before = toDate == null || !d.isAfter(toDate);
                    return after && before;
                })
                .sorted(Comparator.comparing(Booking::getBookingId).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private static boolean isEmpty(String s) { return s == null || s.isEmpty(); }
    private static String opt(String s) { return s == null ? "" : s; }
    private static String fullName(User u) {
        String f = opt(u.getFirstName()), s = opt(u.getSecondName());
        String name = (f + " " + s).trim();
        return name.isEmpty() ? opt(u.getEmail()) : name;
    }

    @Data
    public static class ContactRequest {
        private String name;
        private String email;
        private String phone;
        private String subject;
        private String message;
        private String preferredContact; // email | phone
    }

    @Data
    public static class StaffDto {
        private final Long userId;
        private final String name;
        private final String email;
        private final String contactNo;
        private final String role;
    }
}