package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.dto.PaymentHistoryDTO;
import com.boatsafari.managementsystem.dto.PaymentStatsDTO;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentAdminService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<PaymentHistoryDTO> getPaymentHistory() {
        return bookingRepository.findPaymentHistoryWithDetails();
    }

    public PaymentStatsDTO getPaymentStats() {
        PaymentStatsDTO stats = new PaymentStatsDTO();
        
        // Get total revenue and payment count
        Double totalRevenue = paymentRepository.getTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);
        
        Long totalPayments = paymentRepository.getTotalPaymentCount();
        stats.setTotalPayments(totalPayments != null ? totalPayments : 0);
        
        // Get payment method statistics
        Long cardPayments = paymentRepository.getPaymentCountByMethod("Card");
        stats.setCardPayments(cardPayments != null ? cardPayments : 0);
        
        Double cardAmount = paymentRepository.getRevenueByMethod("Card");
        stats.setCardPaymentAmount(cardAmount != null ? cardAmount : 0.0);
        
        Long onArrivalPayments = paymentRepository.getPaymentCountByMethod("On Arrival");
        stats.setOnArrivalPayments(onArrivalPayments != null ? onArrivalPayments : 0);
        
        Double onArrivalAmount = paymentRepository.getRevenueByMethod("On Arrival");
        stats.setOnArrivalPaymentAmount(onArrivalAmount != null ? onArrivalAmount : 0.0);
        
        // Get payment status statistics
        Long completedPayments = paymentRepository.getPaymentCountByStatus("Completed");
        stats.setCompletedPayments(completedPayments != null ? completedPayments : 0);
        
        Long pendingPayments = paymentRepository.getPaymentCountByStatus("Pending");
        stats.setPendingPayments(pendingPayments != null ? pendingPayments : 0);
        
        Long failedPayments = paymentRepository.getPaymentCountByStatus("Failed");
        stats.setFailedPayments(failedPayments != null ? failedPayments : 0);
        
        return stats;
    }

    public List<PaymentHistoryDTO> searchPayments(String customerName, String email, String status, String paymentMethod) {
        return bookingRepository.searchPaymentHistory(customerName, email, status, paymentMethod);
    }
}