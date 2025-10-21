package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.model.Feedback;
import com.boatsafari.managementsystem.model.User;
import com.boatsafari.managementsystem.model.Booking;
import com.boatsafari.managementsystem.repository.FeedbackRepository;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.util.CurrentUserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for Feedback operations with comprehensive business logic.
 */
@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    /**
     * Submit new feedback from a user
     */
    @Transactional
    public Feedback submitFeedback(String title, String comments, String category, Integer rating) {
        return submitFeedback(title, comments, null, category, rating, null);
    }

    /**
     * Submit anonymous feedback (public - no authentication required)
     */
    @Transactional
    public Feedback submitAnonymousFeedback(String title, String comments, String category, Integer rating) {
        // Validate input
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback title is required");
        }
        if (comments == null || comments.trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback comments are required");
        }
        if (category == null || category.trim().isEmpty()) {
            category = "GENERAL";
        }
        
        // Validate rating if provided
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        try {
            Feedback feedback = new Feedback();
            feedback.setTitle(title.trim());
            feedback.setComments(comments.trim());
            feedback.setCategory(category.toUpperCase());
            feedback.setRating(rating);
            feedback.setUser(null); // Anonymous feedback - no user association
            feedback.setBooking(null); // No booking association for anonymous feedback
            feedback.setRepliedBy(null); // No reply initially
            feedback.setIsVisible(true);
            feedback.setCreatedAt(LocalDateTime.now());
            // Ensure other fields are null for anonymous feedback
            feedback.setReply(null);
            feedback.setRepliedAt(null);
            feedback.setUpdatedAt(null);
            feedback.setExperience(null);

            return feedbackRepository.save(feedback);
        } catch (Exception e) {
            // Log the actual error for debugging
            System.err.println("Error saving anonymous feedback: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save feedback: " + e.getMessage(), e);
        }
    }

    /**
     * Submit new feedback from a user (full version)
     */
    @Transactional
    public Feedback submitFeedback(String title, String comments, String experience, 
                                   String category, Integer rating, Long bookingId) {
        User currentUser = currentUserUtil.getCurrentUser();
        
        if (currentUser == null) {
            throw new IllegalArgumentException("User must be authenticated to submit feedback");
        }

        // Validate input
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback title is required");
        }
        if (comments == null || comments.trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback comments are required");
        }
        if (category == null || category.trim().isEmpty()) {
            category = "GENERAL";
        }
        
        // Validate rating if provided
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Feedback feedback = new Feedback();
        feedback.setTitle(title.trim());
        feedback.setComments(comments.trim());
        feedback.setExperience(experience != null ? experience.trim() : null);
        feedback.setCategory(category.toUpperCase());
        feedback.setRating(rating);
        feedback.setUser(currentUser);
        feedback.setIsVisible(true);
        feedback.setCreatedAt(LocalDateTime.now());

        // Link to booking if provided
        if (bookingId != null) {
            Optional<Booking> booking = bookingRepository.findById(bookingId);
            if (booking.isPresent()) {
                feedback.setBooking(booking.get());
            }
        }

        return feedbackRepository.save(feedback);
    }

    /**
     * Get all visible feedbacks (public view)
     */
    public List<Feedback> getAllVisibleFeedbacks() {
        return feedbackRepository.findByIsVisibleTrueOrderByCreatedAtDesc();
    }

    /**
     * Get all feedbacks (IT Support view)
     */
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get feedbacks by category
     */
    public List<Feedback> getFeedbacksByCategory(String category) {
        return feedbackRepository.findByCategoryAndIsVisibleTrueOrderByCreatedAtDesc(category.toUpperCase());
    }

    /**
     * Get feedbacks by current user
     */
    public List<Feedback> getCurrentUserFeedbacks() {
        User currentUser = currentUserUtil.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User must be authenticated");
        }
        return feedbackRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    /**
     * Get feedbacks by user ID (admin/IT support only)
     */
    public List<Feedback> getFeedbacksByUserId(Long userId) {
        return feedbackRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get feedback by ID
     */
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    /**
     * Reply to feedback (IT Support only)
     */
    @Transactional
    public Feedback replyToFeedback(Long feedbackId, String reply) {
        User currentUser = currentUserUtil.getCurrentUser();
        
        if (currentUser == null) {
            throw new IllegalArgumentException("User must be authenticated to reply to feedback");
        }

        // Check if user has IT Support role
        String userRole = currentUser.getRole();
        if (!userRole.equals("IT_SUPPORT") && !userRole.equals("IT_ASSISTANT") && !userRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Only IT Support staff can reply to feedback");
        }

        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (!feedbackOpt.isPresent()) {
            throw new IllegalArgumentException("Feedback not found");
        }

        if (reply == null || reply.trim().isEmpty()) {
            throw new IllegalArgumentException("Reply content is required");
        }

        Feedback feedback = feedbackOpt.get();
        feedback.setReply(reply.trim());
        feedback.setRepliedBy(currentUser);
        feedback.setRepliedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());

        return feedbackRepository.save(feedback);
    }

    /**
     * Hide/Show feedback (IT Support only)
     */
    @Transactional
    public Feedback toggleFeedbackVisibility(Long feedbackId) {
        User currentUser = currentUserUtil.getCurrentUser();
        
        if (currentUser == null) {
            throw new IllegalArgumentException("User must be authenticated");
        }

        // Check if user has IT Support role
        String userRole = currentUser.getRole();
        if (!userRole.equals("IT_SUPPORT") && !userRole.equals("IT_ASSISTANT") && !userRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Only IT Support staff can hide/show feedback");
        }

        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (!feedbackOpt.isPresent()) {
            throw new IllegalArgumentException("Feedback not found");
        }

        Feedback feedback = feedbackOpt.get();
        feedback.setIsVisible(!feedback.getIsVisible());
        feedback.setUpdatedAt(LocalDateTime.now());

        return feedbackRepository.save(feedback);
    }

    /**
     * Delete feedback (admin only)
     */
    @Transactional
    public void deleteFeedback(Long feedbackId) {
        User currentUser = currentUserUtil.getCurrentUser();
        
        if (currentUser == null) {
            throw new IllegalArgumentException("User must be authenticated");
        }

        // Check if user has admin role
        String userRole = currentUser.getRole();
        if (!userRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Only administrators can delete feedback");
        }

        if (!feedbackRepository.existsById(feedbackId)) {
            throw new IllegalArgumentException("Feedback not found");
        }

        feedbackRepository.deleteById(feedbackId);
    }

    /**
     * Get feedbacks without replies (for IT Support dashboard)
     */
    public List<Feedback> getFeedbacksWithoutReplies() {
        return feedbackRepository.findFeedbacksWithoutReplies();
    }

    /**
     * Get feedbacks with replies
     */
    public List<Feedback> getFeedbacksWithReplies() {
        return feedbackRepository.findFeedbacksWithReplies();
    }

    /**
     * Get feedback statistics
     */
    public FeedbackStats getFeedbackStats() {
        long totalFeedbacks = feedbackRepository.countByIsVisibleTrue();
        long feedbacksWithReplies = feedbackRepository.countFeedbacksWithReplies();
        long pendingReplies = totalFeedbacks - feedbacksWithReplies;
        
        return new FeedbackStats(totalFeedbacks, feedbacksWithReplies, pendingReplies);
    }

    /**
     * DTO for feedback statistics
     */
    public static class FeedbackStats {
        private final long totalFeedbacks;
        private final long feedbacksWithReplies;
        private final long pendingReplies;

        public FeedbackStats(long totalFeedbacks, long feedbacksWithReplies, long pendingReplies) {
            this.totalFeedbacks = totalFeedbacks;
            this.feedbacksWithReplies = feedbacksWithReplies;
            this.pendingReplies = pendingReplies;
        }

        public long getTotalFeedbacks() { return totalFeedbacks; }
        public long getFeedbacksWithReplies() { return feedbacksWithReplies; }
        public long getPendingReplies() { return pendingReplies; }
    }
}