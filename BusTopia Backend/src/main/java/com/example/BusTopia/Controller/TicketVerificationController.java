package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.TicketVerification.TicketVerificationResponse;
import com.example.BusTopia.Services.TicketVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class TicketVerificationController {

    private final TicketVerificationService ticketVerificationService;

    public TicketVerificationController(TicketVerificationService ticketVerificationService) {
        this.ticketVerificationService = ticketVerificationService;
    }

    @GetMapping("/verifyTicket")
    public ResponseEntity<?> verifyTicket(@RequestParam("ticketCode") String ticketCode,
                                          @RequestParam("companyName") String companyName) {

        TicketVerificationResponse response = ticketVerificationService.verifyTicket(ticketCode, companyName);
        return ResponseEntity.ok(response);
    }
}
