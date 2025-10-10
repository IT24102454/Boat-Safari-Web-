package com.boatsafari.managementsystem.dto;

/**
 * DTO for assigning resources (boat and guide) to a trip
 */
public class AssignResourcesDto {
    private Long tripId;
    private Long boatId;
    private Long guideId;

    // Default constructor
    public AssignResourcesDto() {}

    // Constructor with all fields
    public AssignResourcesDto(Long tripId, Long boatId, Long guideId) {
        this.tripId = tripId;
        this.boatId = boatId;
        this.guideId = guideId;
    }

    // Getters and Setters
    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public Long getBoatId() {
        return boatId;
    }

    public void setBoatId(Long boatId) {
        this.boatId = boatId;
    }

    public Long getGuideId() {
        return guideId;
    }

    public void setGuideId(Long guideId) {
        this.guideId = guideId;
    }

    @Override
    public String toString() {
        return "AssignResourcesDto{" +
                "tripId=" + tripId +
                ", boatId=" + boatId +
                ", guideId=" + guideId +
                '}';
    }
}