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
        t.setPriority("MEDIUM"); // Default priority
        t.setCategory(determineCategory(req.getSubject(), req.getMessage()));
        t.setCreatedAt(LocalDateTime.now());
        t.setUpdatedAt(LocalDateTime.now());
        SupportTicket saved = supportTicketRepository.save(t);
        return ResponseEntity.ok(Map.of(
                "message", "Ticket created successfully. Our team will contact you soon.",
                "ticketId", saved.getTicketId()
        ));
    }

    // IT Support: Get all support tickets
    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedTo
    ) {
        List<SupportTicket> all = supportTicketRepository.findAll();
        
        List<SupportTicket> filtered = all.stream()
                .filter(t -> isEmpty(status) || status.equalsIgnoreCase(opt(t.getStatus())))
                .filter(t -> isEmpty(priority) || priority.equalsIgnoreCase(opt(t.getPriority())))
                .filter(t -> isEmpty(category) || category.equalsIgnoreCase(opt(t.getCategory())))
                .filter(t -> isEmpty(assignedTo) || opt(t.getAssignedTo()).toLowerCase().contains(assignedTo.toLowerCase()))
                .sorted(Comparator.comparing(SupportTicket::getCreatedAt).reversed())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(filtered);
    }

    // IT Support: Get ticket by ID
    @GetMapping("/tickets/{id}")
    public ResponseEntity<SupportTicket> getTicketById(@PathVariable Long id) {
        Optional<SupportTicket> ticket = supportTicketRepository.findById(id);
        if (ticket.isPresent()) {
            return ResponseEntity.ok(ticket.get());
        }
        return ResponseEntity.notFound().build();
    }

    // IT Support: Update ticket (assign, change status, priority)
    @PutMapping("/tickets/{id}")
    public ResponseEntity<Map<String, Object>> updateTicket(@PathVariable Long id, @RequestBody UpdateTicketRequest req) {
        Optional<SupportTicket> optTicket = supportTicketRepository.findById(id);
        if (!optTicket.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        SupportTicket ticket = optTicket.get();
        
        if (!isEmpty(req.getStatus())) {
            ticket.setStatus(req.getStatus());
        }
        if (!isEmpty(req.getPriority())) {
            ticket.setPriority(req.getPriority());
        }
        if (!isEmpty(req.getAssignedTo())) {
            ticket.setAssignedTo(req.getAssignedTo());
        }
        if (!isEmpty(req.getCategory())) {
            ticket.setCategory(req.getCategory());
        }
        
        ticket.setUpdatedAt(LocalDateTime.now());
        
        SupportTicket saved = supportTicketRepository.save(ticket);
        
        return ResponseEntity.ok(Map.of(
                "message", "Ticket updated successfully",
                "ticket", saved
        ));
    }

    // IT Support: Reply to ticket
    @PostMapping("/tickets/{id}/reply")
    public ResponseEntity<Map<String, Object>> replyToTicket(@PathVariable Long id, @RequestBody ReplyRequest req) {
        if (isBlank(req.getReply())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reply message cannot be empty."));
        }
        
        Optional<SupportTicket> optTicket = supportTicketRepository.findById(id);
        if (!optTicket.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        SupportTicket ticket = optTicket.get();
        ticket.setReply(req.getReply().trim());
        ticket.setRepliedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        if (!isEmpty(req.getAssignedTo())) {
            ticket.setAssignedTo(req.getAssignedTo());
        }
        
        // Auto-update status based on reply
        if ("NEW".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }
        
        SupportTicket saved = supportTicketRepository.save(ticket);
        
        return ResponseEntity.ok(Map.of(
                "message", "Reply sent successfully",
                "ticket", saved
        ));
    }

    // IT Support: Get ticket statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTicketStats() {
        List<SupportTicket> all = supportTicketRepository.findAll();
        
        Map<String, Long> statusCounts = all.stream()
                .collect(Collectors.groupingBy(
                    t -> opt(t.getStatus()),
                    Collectors.counting()
                ));
                
        Map<String, Long> priorityCounts = all.stream()
                .collect(Collectors.groupingBy(
                    t -> opt(t.getPriority()),
                    Collectors.counting()
                ));
                
        Map<String, Long> categoryCounts = all.stream()
                .collect(Collectors.groupingBy(
                    t -> opt(t.getCategory()),
                    Collectors.counting()
                ));
        
        long totalTickets = all.size();
        long newTickets = statusCounts.getOrDefault("NEW", 0L);
        long openTickets = statusCounts.getOrDefault("OPEN", 0L) + statusCounts.getOrDefault("IN_PROGRESS", 0L);
        long resolvedTickets = statusCounts.getOrDefault("RESOLVED", 0L) + statusCounts.getOrDefault("CLOSED", 0L);
        
        return ResponseEntity.ok(Map.of(
                "totalTickets", totalTickets,
                "newTickets", newTickets,
                "openTickets", openTickets,
                "resolvedTickets", resolvedTickets,
                "statusBreakdown", statusCounts,
                "priorityBreakdown", priorityCounts,
                "categoryBreakdown", categoryCounts
        ));
    }

    // Helper method to determine category based on subject and message
    private String determineCategory(String subject, String message) {
        String content = (subject + " " + message).toLowerCase();
        
        if (content.contains("booking") || content.contains("reservation") || content.contains("trip")) {
            return "BOOKING";
        } else if (content.contains("payment") || content.contains("billing") || content.contains("refund")) {
            return "PAYMENT";
        } else if (content.contains("website") || content.contains("login") || content.contains("error") || content.contains("bug")) {
            return "TECHNICAL";
        } else {
            return "GENERAL";
        }
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
    public static class UpdateTicketRequest {
        private String status;
        private String priority;
        private String assignedTo;
        private String category;
    }

    @Data
    public static class ReplyRequest {
        private String reply;
        private String assignedTo;
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