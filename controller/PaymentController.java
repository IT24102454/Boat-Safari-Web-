package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.dto.PaymentRequest;
import com.boatsafari.managementsystem.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {


    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> process(@RequestBody PaymentRequest request) {
        Map<String, Object> result = paymentService.processPayment(request);
        return ResponseEntity.ok(result);
    }
}