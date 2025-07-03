package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.BuyTicket.BookTicketRequest;
import com.example.BusTopia.DatabaseEntity.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.BusTopia.Services.TicketService;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @PostMapping("/book")
    public ResponseEntity<Ticket> book(@RequestBody BookTicketRequest req) {
        Ticket ticket = ticketService.bookTicket(
                req.getUserId(),
                req.getBusId(),
                req.getDate(),
                req.getSource(),
                req.getDestination()
        );
        return ResponseEntity.ok(ticket);
    }
}
