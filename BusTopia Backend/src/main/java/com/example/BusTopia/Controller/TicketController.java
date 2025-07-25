package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.BuyTicket.BookTicketRequest;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.BusTopia.Services.TicketService;

import java.util.Map;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/book")
    public ResponseEntity<Ticket> book(@RequestBody BookTicketRequest req) {
        System.out.println(req);
        Ticket ticket = ticketService.bookTicket(
                req.getUserId(),
                req.getBusId(),
                req.getDate(),
                req.getTime(),
                req.getSource(),
                req.getDestination(),
                req.getSeats()
        );
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelTicket(@RequestBody Map<String, Integer> body) {
        Integer ticketId = body.get("ticketId");
        ticketService.cancelTicket(ticketId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user")
    public ResponseEntity<?> getTicketsByUserId(@RequestParam("userId") Long userId) {
        UserEntity user = userRepository.findById(userId).get();
        return ResponseEntity.ok(ticketService.getTicketsByUser(user));
    }
}
