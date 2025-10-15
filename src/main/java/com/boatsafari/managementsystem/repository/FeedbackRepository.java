package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Feedback;
import com.boatsafari.managementsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Find all visible feedbacks ordered by creation date (newest first)
    List<Feedback> findByIsVisibleTrueOrderByCreatedAtDesc();
    
    // Find all feedbacks (for IT Support) ordered by creation date (newest first)
    List<Feedback> findAllByOrderByCreatedAtDesc();
    
    // Find feedbacks by user
    List<Feedback> findByUserOrderByCreatedAtDesc(User user);
    
    // Find feedbacks by user ID
    List<Feedback> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    
    // Find feedbacks by category that are visible
    List<Feedback> findByCategoryAndIsVisibleTrueOrderByCreatedAtDesc(String category);
    
    // Find feedbacks that have replies
    @Query("SELECT f FROM Feedback f WHERE f.reply IS NOT NULL AND f.isVisible = true ORDER BY f.createdAt DESC")
    List<Feedback> findFeedbacksWithReplies();
    
    // Find feedbacks without replies
    @Query("SELECT f FROM Feedback f WHERE f.reply IS NULL ORDER BY f.createdAt DESC")
    List<Feedback> findFeedbacksWithoutReplies();
    
    // Find feedbacks by rating range that are visible
    List<Feedback> findByRatingBetweenAndIsVisibleTrueOrderByCreatedAtDesc(Integer minRating, Integer maxRating);
    
    // Count visible feedbacks
    Long countByIsVisibleTrue();
    
    // Count feedbacks with replies
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.reply IS NOT NULL")
    Long countFeedbacksWithReplies();
    
    // Find feedbacks related to a specific booking
    List<Feedback> findByBooking_BookingIdAndIsVisibleTrueOrderByCreatedAtDesc(Long bookingId);
}