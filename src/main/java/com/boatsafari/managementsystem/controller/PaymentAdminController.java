package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.dto.PaymentHistoryDTO;
import com.boatsafari.managementsystem.dto.PaymentStatsDTO;
import com.boatsafari.managementsystem.service.PaymentAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = "*")
public class PaymentAdminController {

    @Autowired
    private PaymentAdminService paymentAdminService;

    @GetMapping("/history")
    public ResponseEntity<List<PaymentHistoryDTO>> getPaymentHistory() {
        List<PaymentHistoryDTO> paymentHistory = paymentAdminService.getPaymentHistory();
        return ResponseEntity.ok(paymentHistory);
    }

    @GetMapping("/stats")
    public ResponseEntity<PaymentStatsDTO> getPaymentStats() {
        PaymentStatsDTO stats = paymentAdminService.getPaymentStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PaymentHistoryDTO>> searchPayments(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod) {
        List<PaymentHistoryDTO> results = paymentAdminService.searchPayments(customerName, email, status, paymentMethod);
        return ResponseEntity.ok(results);
    }
}