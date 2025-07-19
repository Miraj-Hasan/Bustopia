package com.example.BusTopia.Controller;


import com.example.BusTopia.DTOs.BuyTicket.BookTicketRequest;
import com.example.BusTopia.DTOs.Payment.PaymentRequest;
import com.example.BusTopia.Services.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final Environment env;
    private final TicketService ticketService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, BookTicketRequest> pendingBookings = new ConcurrentHashMap<>();

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody PaymentRequest payment) {
        String apiUrl = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
        String tranId = payment.getTranId();

        pendingBookings.put(tranId, payment.getBookingData()); // TEMP STORE

        MultiValueMap<String, String> payload = new LinkedMultiValueMap<>();
        payload.add("store_id", env.getProperty("sslcommerz.store.id"));
        payload.add("store_passwd", env.getProperty("sslcommerz.store.password"));
        payload.add("total_amount", String.valueOf(payment.getAmount()));
        payload.add("currency", "BDT");
        payload.add("tran_id", tranId);
        payload.add("success_url", env.getProperty("payment.success.url"));
        payload.add("fail_url", env.getProperty("payment.fail.url"));
        payload.add("cancel_url", env.getProperty("payment.cancel.url"));
        payload.add("cus_name", payment.getCustomerName());
        payload.add("cus_email", payment.getCustomerEmail());
        payload.add("cus_phone", payment.getCustomerPhone());
        payload.add("cus_add1", "Dhaka");
        payload.add("cus_city", "Dhaka");
        payload.add("cus_country", "Bangladesh");
        payload.add("shipping_method", "NO");
        payload.add("num_of_item", "1");
        payload.add("ship_name", payment.getCustomerName());
        payload.add("ship_add1", "Dhaka");
        payload.add("ship_city", "Dhaka");
        payload.add("ship_country", "Bangladesh");
        payload.add("product_name", "Bus Ticket");
        payload.add("product_category", "bus ticket");
        payload.add("product_profile", "general");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, new HttpEntity<>(payload, headers), Map.class);
            Map body = response.getBody();

            if ("SUCCESS".equalsIgnoreCase((String) body.get("status"))) {
                return ResponseEntity.ok(Map.of("url", body.get("GatewayPageURL")));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Payment initiation failed");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error initiating payment: " + e.getMessage());
        }
    }

    @PostMapping("/success")
    public ResponseEntity<Void> handleSuccess(@RequestParam Map<String, String> params) {
        String tranId = params.get("tran_id");
        BookTicketRequest booking = pendingBookings.remove(tranId);

        if (booking != null) {
            try {
                ticketService.bookTicket(
                        booking.getUserId(),
                        booking.getBusId(),
                        booking.getDate(),
                        booking.getTime(),
                        booking.getSource(),
                        booking.getDestination(),
                        booking.getSeats()
                );
            } catch (Exception e) {
                e.printStackTrace(); // Optional: log or store for debugging
            }
        }

        String redirectUrl = env.getProperty("frontend.origin") + "/payment-result?status=success";
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/fail")
    public ResponseEntity<Void> handleFail(@RequestParam Map<String, String> params) {
        pendingBookings.remove(params.get("tran_id"));
        String redirectUrl = env.getProperty("frontend.origin") + "/payment-result?status=fail";
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> handleCancel(@RequestParam Map<String, String> params) {
        pendingBookings.remove(params.get("tran_id"));
        String redirectUrl = env.getProperty("frontend.origin") + "/payment-result?status=cancel";
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
    }
}
