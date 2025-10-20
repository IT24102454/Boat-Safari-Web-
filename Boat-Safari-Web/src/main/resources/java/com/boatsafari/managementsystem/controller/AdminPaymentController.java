package com.boatsafari.managementsystem.controller;

import com.boatsafari.managementsystem.dto.PaymentAdminDTO;
import com.boatsafari.managementsystem.repository.PaymentRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping
    public List<PaymentAdminDTO> listPayments() {
        return paymentRepository.findAdminPaymentHistory();
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportPaymentsXlsx() {
        List<PaymentAdminDTO> data = paymentRepository.findAdminPaymentHistory();
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Payments");
            int rowIdx = 0;
            // Header
            Row header = sheet.createRow(rowIdx++);
            String[] cols = new String[] {
                    "Payment ID", "Booking ID", "Customer", "Email", "Method", "Status", "Amount", "Payment Date"
            };
            for (int i = 0; i < cols.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
            }
            // Rows
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (PaymentAdminDTO p : data) {
                Row r = sheet.createRow(rowIdx++);
                int col = 0;
                r.createCell(col++).setCellValue(p.getPaymentId() != null ? String.valueOf(p.getPaymentId()) : "");
                r.createCell(col++).setCellValue(p.getBookingId() != null ? String.valueOf(p.getBookingId()) : "");
                r.createCell(col++).setCellValue(p.getCustomerName() == null ? "" : p.getCustomerName());
                r.createCell(col++).setCellValue(p.getCustomerEmail() == null ? "" : p.getCustomerEmail());
                r.createCell(col++).setCellValue(p.getPaymentMethod() == null ? "" : p.getPaymentMethod());
                r.createCell(col++).setCellValue(p.getStatus() == null ? "" : p.getStatus());
                r.createCell(col++).setCellValue(p.getAmount());
                LocalDateTime dt = p.getPaymentDate();
                r.createCell(col++).setCellValue(dt != null ? dt.format(dtf) : "");
            }
            for (int i = 0; i < cols.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            wb.write(bos);
            byte[] bytes = bos.toByteArray();

            String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"));
            String filename = "payments-" + ts + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + encodeAscii(filename))
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String encodeAscii(String in) {
        // Ensure ASCII-friendly filename for header
        return new String(in.getBytes(StandardCharsets.US_ASCII), StandardCharsets.US_ASCII);
    }
}
