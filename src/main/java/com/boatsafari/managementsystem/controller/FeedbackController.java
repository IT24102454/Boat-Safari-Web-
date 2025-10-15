package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.model.Feedback;
import com.boatsafari.managementsystem.service.FeedbackService;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // ================= Public endpoints =================

    // List visible feedbacks for the website (DTOs)
    @GetMapping("/public")
    public List<FeedbackDTO> listPublicFeedbacks() {
        return feedbackService.getAllVisibleFeedbacks()
                .stream()
                .map(FeedbackController::toDto)
                .collect(Collectors.toList());
    }

    // List by category (DTOs)
    @GetMapping("/public/category/{category}")
    public List<FeedbackDTO> listPublicByCategory(@PathVariable String category) {
        return feedbackService.getFeedbacksByCategory(category)
                .stream()
                .map(FeedbackController::toDto)
                .collect(Collectors.toList());
    }

    // Submit anonymous feedback (public)
    @PostMapping("/public")
    public ResponseEntity<?> submitAnonymous(@RequestBody SubmitRequest req) {
        try {
            Feedback saved = feedbackService.submitAnonymousFeedback(
                    req.getTitle(), req.getComments(), req.getCategory(), req.getRating());
            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to submit feedback"));
        }
    }

    // ================= Authenticated endpoints =================

    // Submit feedback (logged-in users)
    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody SubmitRequest request) {
        try {
            Feedback feedback = feedbackService.submitFeedback(
                    request.getTitle(),
                    request.getComments(),
                    request.getCategory(),
                    request.getRating()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Feedback submitted successfully");
            response.put("feedbackId", feedback.getFeedbackId());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to submit feedback"));
        }
    }

    // Current user's feedbacks
    @GetMapping("/my-feedbacks")
    public ResponseEntity<?> getMyFeedbacks() {
        try {
            List<Feedback> feedbacks = feedbackService.getCurrentUserFeedbacks();
            return ResponseEntity.ok(feedbacks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve feedbacks"));
        }
    }

    // Get by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long id) {
        try {
            Optional<Feedback> feedback = feedbackService.getFeedbackById(id);
            return feedback.<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve feedback"));
        }
    }

    // ================= IT/Admin endpoints =================

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllFeedbacks() {
        try {
            return ResponseEntity.ok(feedbackService.getAllFeedbacks());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve feedbacks"));
        }
    }

    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingFeedbacks() {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbacksWithoutReplies());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve pending feedbacks"));
        }
    }

    @GetMapping("/admin/replied")
    public ResponseEntity<?> getRepliedFeedbacks() {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbacksWithReplies());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve replied feedbacks"));
        }
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToFeedback(@PathVariable Long id, @RequestBody ReplyRequest request) {
        try {
            Feedback feedback = feedbackService.replyToFeedback(id, request.getReply());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Reply submitted successfully");
            response.put("feedback", feedback);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to submit reply"));
        }
    }

    @PutMapping("/{id}/toggle-visibility")
    public ResponseEntity<?> toggleVisibility(@PathVariable Long id) {
        try {
            Feedback feedback = feedbackService.toggleFeedbackVisibility(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Feedback visibility updated successfully");
            response.put("isVisible", feedback.getIsVisible());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to update feedback visibility"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.ok(Map.of("message", "Feedback deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to delete feedback"));
        }
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<?> getFeedbackStats() {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbackStats());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve feedback statistics"));
        }
    }

    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<?> getFeedbacksByUserId(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(feedbackService.getFeedbacksByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to retrieve user feedbacks"));
        }
    }

    // ================= DTOs/helpers =================

    private static FeedbackDTO toDto(Feedback f) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(f.getFeedbackId());
        dto.setTitle(f.getTitle());
        dto.setComments(f.getComments());
        dto.setCategory(f.getCategory());
        dto.setRating(f.getRating());
        dto.setReply(f.getReply());
        dto.setCreatedAt(f.getCreatedAt());
        String userName = null;
        try {
            if (f.getUser() != null) {
                String first = f.getUser().getFirstName();
                String email = f.getUser().getEmail();
                userName = (first != null && !first.isEmpty()) ? first : email;
            }
        } catch (Exception ignore) {
            // In case of lazy loading outside session, keep userName null
        }
        dto.setUserName(userName);
        return dto;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubmitRequest {
        private String title;
        private String comments;
        private String category;
        private Integer rating;
    }

    @Data
    public static class ReplyRequest {
        private String reply;
    }

    @Data
    public static class ErrorResponse {
        private final String message;
    }

    @Data
    public static class FeedbackDTO {
        private Long id;
        private String title;
        private String comments;
        private String category;
        private Integer rating;
        private String reply;
        private String userName;
        private LocalDateTime createdAt;
    }
}