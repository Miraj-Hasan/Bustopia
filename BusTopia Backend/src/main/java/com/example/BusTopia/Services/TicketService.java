package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@Data
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final BusRepository busRepository;
    private final UserRepository userRepository;
    private final TimeMappingRepository timeMappingRepository;
    private final PriceMappingRepository priceMappingRepository;

    public Ticket bookTicket(Long userId, Integer busId, LocalDate date, LocalTime time, String source, String destination) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int price = priceMappingRepository.getPrice(source, destination, bus.getCategory())
                .orElse(0);

        // Build ticket
        Ticket ticket = new Ticket();
        ticket.setBus(bus);
        ticket.setUser(user);
        ticket.setDate(date);
        ticket.setScheduledTime(time);
        ticket.setSource(source);
        ticket.setDestination(destination);
        ticket.setBookingTime(LocalTime.now());
        ticket.setStatus("BOOKED");
        ticket.setPrice(price);

        // Generate ticketCode
        ticket.generateTicketCode();

        return ticketRepository.save(ticket);
    }
}

