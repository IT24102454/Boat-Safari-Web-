package com.boatsafari.managementsystem.dto;

import java.time.LocalDateTime;

/**
 * DTO for creating a new notification
 */
public class CreateNotificationDto {
    private String title;
    private String message;
    private String priority;
    private String targetAudience;
    private LocalDateTime expiresAt;

    // Default constructor
    public CreateNotificationDto() {}

    // Constructor with required fields
    public CreateNotificationDto(String title, String message) {
        this.title = title;
        this.message = message;
        this.priority = "MEDIUM";
        this.targetAudience = "ALL_USERS";
    }

    // Full constructor
    public CreateNotificationDto(String title, String message, 
                                String priority,
                                String targetAudience,
                                LocalDateTime expiresAt) {
        this.title = title;
        this.message = message;
        this.priority = priority;
        this.targetAudience = targetAudience;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    @Override
    public String toString() {
        return "CreateNotificationDto{" +
                "title='" + title + '\'' +
                ", message='" + message + '\'' +
                ", priority=" + priority +
                ", targetAudience=" + targetAudience +
                ", expiresAt=" + expiresAt +
                '}';
    }
}