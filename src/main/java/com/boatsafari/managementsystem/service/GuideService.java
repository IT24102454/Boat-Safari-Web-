package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.dto.GuideAssignedTripDTO;
import com.boatsafari.managementsystem.dto.PassengerDTO;
import com.boatsafari.managementsystem.model.*;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.repository.PassengerCheckInRepository;
import com.boatsafari.managementsystem.repository.SafariGuideRepository;
import com.boatsafari.managementsystem.repository.TripRepository;
import com.boatsafari.managementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GuideService {

    @Autowired
    private SafariGuideRepository safariguideRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PassengerCheckInRepository passengerCheckInRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Optional<SafariGuide> findGuideByEmail(String email) {
        // First try to find as SafariGuide entity
        Optional<SafariGuide> guide = safariguideRepository.findByEmail(email);
        if (guide.isPresent()) {
            return guide;
        }
        
        // If not found, check if there's a regular User with guide role (legacy data)
        User user = userRepository.findByEmail(email);
        if (user != null && ("GUIDE".equals(user.getRole()) || "SAFARI_GUIDE".equals(user.getRole()))) {
            // Convert to SafariGuide if it's not already one
            if (user instanceof SafariGuide) {
                return Optional.of((SafariGuide) user);
            }
            // For legacy users with GUIDE role that aren't SafariGuide entities,
            // we can't convert them here without data migration
            // Log this case for admin attention
            System.err.println("Found guide user with email " + email + " but it's not a SafariGuide entity. Role: " + user.getRole());
        }
        
        return Optional.empty();
    }

    public List<GuideAssignedTripDTO> getUpcomingTripsForGuide(Long guideId) {
        List<Trip> upcomingTrips = tripRepository.findByGuide_UserIdAndDateGreaterThanEqual(
                guideId, LocalDate.now());
        return convertToGuideAssignedTripDTOs(upcomingTrips);
    }

    public List<GuideAssignedTripDTO> getPastTripsForGuide(Long guideId) {
        List<Trip> pastTrips = tripRepository.findByGuide_UserIdAndDateLessThan(
                guideId, LocalDate.now());
        return convertToGuideAssignedTripDTOs(pastTrips);
    }

    private List<GuideAssignedTripDTO> convertToGuideAssignedTripDTOs(List<Trip> trips) {
        return trips.stream().map(trip -> {
            GuideAssignedTripDTO dto = new GuideAssignedTripDTO();
            dto.setTripId(trip.getTripId());
            dto.setName(trip.getName());
            dto.setDescription(trip.getDescription());
            dto.setDate(trip.getDate());
            dto.setStartTime(trip.getStartTime());
            dto.setEndTime(trip.getEndTime());
            dto.setLocation(trip.getLocation());
            dto.setRoute(trip.getRoute());
            dto.setBoatName(trip.getBoat() != null ? trip.getBoat().getBoatName() : "Not assigned");
            dto.setCapacity(trip.getCapacity());

            // Count booked passengers
            List<Booking> bookings = bookingRepository.findByTrip_TripId(trip.getTripId());
            int bookedPassengers = bookings.stream()
                    .filter(b -> "CONFIRMED".equals(b.getStatus()))
                    .mapToInt(Booking::getPassengers)
                    .sum();
            dto.setBookedPassengers(bookedPassengers);

            // Count checked-in passengers
            long checkedInCount = passengerCheckInRepository.countCheckedInPassengersByTripId(trip.getTripId());
            dto.setCheckedInPassengers((int) checkedInCount);

            return dto;
        }).collect(Collectors.toList());
    }

    public List<PassengerDTO> getPassengersForTrip(Long tripId) {
        List<Booking> bookings = bookingRepository.findByTrip_TripId(tripId);
        List<PassengerDTO> passengers = new ArrayList<>();

        for (Booking booking : bookings) {
            if (!"CONFIRMED".equals(booking.getStatus())) {
                continue;
            }

            PassengerDTO passenger = new PassengerDTO();
            passenger.setBookingId(booking.getBookingId());
            passenger.setPassengerName(booking.getName());
            passenger.setContact(booking.getContact());
            passenger.setEmail(booking.getEmail());
            passenger.setPassengerCount(booking.getPassengers());

            // Check if this booking has been checked in
            Optional<PassengerCheckIn> checkIn = passengerCheckInRepository.findByBookingBookingId(booking.getBookingId());
            passenger.setCheckedIn(checkIn.isPresent() && checkIn.get().getCheckedIn());

            passengers.add(passenger);
        }

        return passengers;
    }

    @Transactional
    public boolean checkInPassenger(Long bookingId, Long guideId, String notes) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        Optional<SafariGuide> guideOpt = safariguideRepository.findByUserId(guideId);

        if (bookingOpt.isEmpty() || guideOpt.isEmpty()) {
            return false;
        }

        Booking booking = bookingOpt.get();
        SafariGuide guide = guideOpt.get();

        // Check if a check-in record already exists
        Optional<PassengerCheckIn> existingCheckIn = passengerCheckInRepository.findByBookingBookingId(bookingId);

        if (existingCheckIn.isPresent()) {
            // Update existing check-in
            PassengerCheckIn checkIn = existingCheckIn.get();
            checkIn.setCheckedIn(true);
            checkIn.setCheckInTime(LocalDateTime.now());
            checkIn.setCheckedInBy(guide);
            checkIn.setNotes(notes);
            passengerCheckInRepository.save(checkIn);
        } else {
            // Create new check-in
            PassengerCheckIn checkIn = new PassengerCheckIn();
            checkIn.setBooking(booking);
            checkIn.setCheckedIn(true);
            checkIn.setCheckInTime(LocalDateTime.now());
            checkIn.setCheckedInBy(guide);
            checkIn.setNotes(notes);
            passengerCheckInRepository.save(checkIn);
        }

        return true;
    }

    @Transactional
    public boolean undoCheckIn(Long bookingId) {
        Optional<PassengerCheckIn> checkInOpt = passengerCheckInRepository.findByBookingBookingId(bookingId);

        if (checkInOpt.isEmpty()) {
            return false;
        }

        PassengerCheckIn checkIn = checkInOpt.get();
        checkIn.setCheckedIn(false);
        passengerCheckInRepository.save(checkIn);

        return true;
    }
}
