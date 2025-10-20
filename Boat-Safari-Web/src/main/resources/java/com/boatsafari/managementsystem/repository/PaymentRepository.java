package com.boatsafari.managementsystem.repository;

import com.boatsafari.managementsystem.dto.PaymentAdminDTO;
import com.boatsafari.managementsystem.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByOrderByPaymentDateDesc();

    @Query("select new com.boatsafari.managementsystem.dto.PaymentAdminDTO(p.paymentId, b.bookingId, b.name, b.email, p.paymentMethod, p.status, p.amount, p.paymentDate) " +
           "from Payment p left join Booking b on b.payment = p order by p.paymentDate desc")
    List<PaymentAdminDTO> findAdminPaymentHistory();
}