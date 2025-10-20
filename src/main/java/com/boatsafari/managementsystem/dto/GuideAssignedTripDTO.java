package com.boatsafari.managementsystem.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class GuideAssignedTripDTO {
    private Long tripId;
    private String name;
    private String description;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String route;
    private String boatName;
    private Integer capacity;
    private Integer bookedPassengers;
    private Integer checkedInPassengers;
}
