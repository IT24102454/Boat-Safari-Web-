// src/main/java/com/boatsafari/managementsystem/repository/BookingRepository.java
package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.dto.PaymentHistoryDTO;
import com.boatsafari.managementsystem.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTrip_TripId(Long tripId);
    
    @Query("SELECT new com.boatsafari.managementsystem.dto.PaymentHistoryDTO(" +
           "p.paymentId, b.bookingId, " +
           "COALESCE(u.firstName, b.name), " +
           "COALESCE(u.email, b.email), " +
           "COALESCE(u.contactNo, b.contact), " +
           "p.paymentMethod, p.status, p.amount, p.paymentDate, " +
           "t.name, CAST(t.date AS string), b.passengers) " +
           "FROM Booking b " +
           "LEFT JOIN b.payment p " +
           "LEFT JOIN b.customer u " +
           "LEFT JOIN b.trip t " +
           "WHERE p IS NOT NULL " +
           "ORDER BY p.paymentDate DESC")
    List<PaymentHistoryDTO> findPaymentHistoryWithDetails();
    
    @Query("SELECT new com.boatsafari.managementsystem.dto.PaymentHistoryDTO(" +
           "p.paymentId, b.bookingId, " +
           "COALESCE(u.firstName, b.name), " +
           "COALESCE(u.email, b.email), " +
           "COALESCE(u.contactNo, b.contact), " +
           "p.paymentMethod, p.status, p.amount, p.paymentDate, " +
           "t.name, CAST(t.date AS string), b.passengers) " +
           "FROM Booking b " +
           "LEFT JOIN b.payment p " +
           "LEFT JOIN b.customer u " +
           "LEFT JOIN b.trip t " +
           "WHERE p IS NOT NULL " +
           "AND (:customerName IS NULL OR LOWER(COALESCE(u.firstName, b.name)) LIKE LOWER(CONCAT('%', :customerName, '%'))) " +
           "AND (:email IS NULL OR LOWER(COALESCE(u.email, b.email)) LIKE LOWER(CONCAT('%', :email, '%'))) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod) " +
           "ORDER BY p.paymentDate DESC")
    List<PaymentHistoryDTO> searchPaymentHistory(@Param("customerName") String customerName, 
                                                @Param("email") String email, 
                                                @Param("status") String status, 
                                                @Param("paymentMethod") String paymentMethod);
}