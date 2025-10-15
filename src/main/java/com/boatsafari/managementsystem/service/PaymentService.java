package com.boatsafari.managementsystem.service;

import com.boatsafari.managementsystem.dto.PaymentRequest;
import com.boatsafari.managementsystem.model.Booking;
import com.boatsafari.managementsystem.model.Payment;
import com.boatsafari.managementsystem.repository.BookingRepository;
import com.boatsafari.managementsystem.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService; // to confirm booking on success

    public Map<String, Object> processPayment(PaymentRequest req) {
        Map<String, Object> res = new HashMap<>();

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Idempotency: if already paid successfully, just return success
        if (booking.getPayment() != null && "SUCCESS".equalsIgnoreCase(booking.getPayment().getStatus())) {
            res.put("message", "Payment already completed");
            res.put("bookingId", booking.getBookingId());
            res.put("paymentId", booking.getPayment().getPaymentId());
            res.put("bookingStatus", booking.getStatus());
            res.put("paymentStatus", booking.getPayment().getStatus());
            return res;
        }

        // Prepare Payment
        Payment payment = new Payment();
        payment.setPaymentMethod(req.getMethod());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setAmount(booking.getTotalCost());

        if ("CARD".equalsIgnoreCase(req.getMethod())) {
            validateCard(req);
            // Simulate gateway call -> success
            payment.setStatus("SUCCESS");
            payment.setCardNumber(req.getCardNumber());
            payment.setCardExpiry(req.getCardExpiry());
            payment.setCardCvv(req.getCardCvv());
            payment.setCardHolderName(req.getCardHolderName());

            Payment saved = paymentRepository.save(payment);
            booking.setPayment(saved);

            // Confirm booking if within hold window and provisional
            try {
                bookingService.confirmBooking(booking.getBookingId());
            } catch (Exception e) {
                // If confirmation fails, still mark booking as confirmed since payment succeeded
                booking.setStatus("CONFIRMED");
            }
            bookingRepository.save(booking);

            res.put("message", "Payment successful. Booking confirmed.");
            res.put("bookingId", booking.getBookingId());
            res.put("paymentId", saved.getPaymentId());
            res.put("bookingStatus", booking.getStatus());
            res.put("paymentStatus", saved.getStatus());
            return res;

        } else if ("PAY_ON_ARRIVAL".equalsIgnoreCase(req.getMethod())) {
            payment.setStatus("PENDING"); // will be paid at dock
            Payment saved = paymentRepository.save(payment);
            booking.setPayment(saved);

            // Confirm seat but mark payment pending
            if (!"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
                // Allow confirmation for cash too (skip hold check if you prefer)
                booking.setStatus("CONFIRMED");
            }
            bookingRepository.save(booking);

            res.put("message", "Booking confirmed. Please pay at the dock on arrival.");
            res.put("bookingId", booking.getBookingId());
            res.put("paymentId", saved.getPaymentId());
            res.put("bookingStatus", booking.getStatus());
            res.put("paymentStatus", saved.getStatus());
            return res;

        } else {
            throw new IllegalArgumentException("Invalid payment method");
        }
    }

    private void validateCard(PaymentRequest req) {
        if (isBlank(req.getCardHolderName())) throw new IllegalArgumentException("Cardholder name required");
        if (isBlank(req.getCardNumber()) || req.getCardNumber().replaceAll("\\s", "").length() != 16)
            throw new IllegalArgumentException("Card number must be 16 digits");
        if (isBlank(req.getCardExpiry()) || !req.getCardExpiry().matches("^(0[1-9]|1[0-2])/(\\d{2})$"))
            throw new IllegalArgumentException("Expiry must be MM/YY");
        if (isBlank(req.getCardCvv()) || !req.getCardCvv().matches("^\\d{3}$"))
            throw new IllegalArgumentException("CVV must be 3 digits");
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}