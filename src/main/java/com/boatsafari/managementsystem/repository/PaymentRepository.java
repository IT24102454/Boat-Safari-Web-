package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = 'Completed'")
    Double getTotalRevenue();
    
    @Query("SELECT COUNT(p) FROM Payment p")
    Long getTotalPaymentCount();
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentMethod = :method")
    Long getPaymentCountByMethod(@Param("method") String method);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.paymentMethod = :method AND p.status = 'Completed'")
    Double getRevenueByMethod(@Param("method") String method);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
    Long getPaymentCountByStatus(@Param("status") String status);
}