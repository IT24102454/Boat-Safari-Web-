package com.boatsafari.managementsystem.dto;

import lombok.Data;

@Data
public class PassengerDTO {
    private Long bookingId;
    private String passengerName;
    private String contact;
    private String email;
    private int passengerCount;
    private boolean checkedIn;
}
