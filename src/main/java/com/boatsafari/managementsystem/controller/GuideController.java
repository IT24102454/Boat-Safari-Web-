package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.dto.GuideAssignedTripDTO;
import com.boatsafari.managementsystem.dto.PassengerDTO;
import com.boatsafari.managementsystem.model.SafariGuide;
import com.boatsafari.managementsystem.service.GuideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/guide")
public class GuideController {

    @Autowired
    private GuideService guideService;

    private SafariGuide getCurrentGuide() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Optional<SafariGuide> guide = guideService.findGuideByEmail(email);
        return guide.orElse(null);
    }

    @GetMapping("/trips/upcoming")
    public ResponseEntity<List<GuideAssignedTripDTO>> getUpcomingTrips() {
        SafariGuide currentGuide = getCurrentGuide();
        if (currentGuide == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(guideService.getUpcomingTripsForGuide(currentGuide.getUserId()));
    }

    @GetMapping("/trips/past")
    public ResponseEntity<List<GuideAssignedTripDTO>> getPastTrips() {
        SafariGuide currentGuide = getCurrentGuide();
        if (currentGuide == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(guideService.getPastTripsForGuide(currentGuide.getUserId()));
    }

    @GetMapping("/trips/{tripId}/passengers")
    public ResponseEntity<List<PassengerDTO>> getPassengersForTrip(@PathVariable Long tripId) {
        SafariGuide currentGuide = getCurrentGuide();
        if (currentGuide == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(guideService.getPassengersForTrip(tripId));
    }

    @PostMapping("/check-in")
    public ResponseEntity<Map<String, Object>> checkInPassenger(
            @RequestParam Long bookingId,
            @RequestParam(required = false) String notes) {
        SafariGuide currentGuide = getCurrentGuide();
        if (currentGuide == null) {
            return ResponseEntity.status(401).build();
        }

        boolean success = guideService.checkInPassenger(bookingId, currentGuide.getUserId(), notes);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);

        if (success) {
            response.put("message", "Check-in completed successfully");
        } else {
            response.put("message", "Failed to complete check-in");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/undo-check-in")
    public ResponseEntity<Map<String, Object>> undoCheckIn(@RequestParam Long bookingId) {
        SafariGuide currentGuide = getCurrentGuide();
        if (currentGuide == null) {
            return ResponseEntity.status(401).build();
        }

        boolean success = guideService.undoCheckIn(bookingId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);

        if (success) {
            response.put("message", "Check-in has been cancelled");
        } else {
            response.put("message", "Failed to cancel check-in");
        }

        return ResponseEntity.ok(response);
    }
}
