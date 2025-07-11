package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.SeatAvailabilityMapping;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final BusRepository busRepository;
    private final UserRepository userRepository;
    private final TimeMappingRepository timeMappingRepository;
    private final PriceMappingRepository priceMappingRepository;
    private final SeatAvailabilityMappingRepository seatAvailabilityRepository;

    @Transactional
    public Ticket bookTicket(Long userId, Integer busId, LocalDate date, LocalTime time, String source, String destination, List<String> seats) {
        if (seats == null || seats.isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected.");
        }
        if (seats.size() > 4) {
            throw new IllegalArgumentException("Cannot book more than 4 seats.");
        }

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch or create SeatAvailabilityMapping
        SeatAvailabilityMapping seatAvailability = seatAvailabilityRepository
                .findByBus_BusIdAndJourneyDate(busId, date)
                .orElseGet(() -> {
                    SeatAvailabilityMapping newMapping = new SeatAvailabilityMapping();
                    newMapping.setBus(bus);
                    newMapping.setJourneyDate(date);
                    newMapping.setTotalSeats(
                            bus.getSeatLayout().getLayout().stream()
                                    .mapToInt(row -> (int) row.stream().filter(seat -> !seat.isEmpty()).count())
                                    .sum()
                    );
                    newMapping.setAvailableSeats(newMapping.getTotalSeats());
                    newMapping.setBookedSeats(new java.util.HashMap<>());
                    return seatAvailabilityRepository.save(newMapping);
                });

        // Validate seat availability
        Map<String, Long> bookedSeats = seatAvailability.getBookedSeats();
        for (String seat : seats) {
            if (bookedSeats.containsKey(seat)) {
                throw new IllegalArgumentException("Seat " + seat + " is already booked.");
            }
        }

        // Get price (price per seat, multiplied by number of seats)
        int pricePerSeat = priceMappingRepository.getPrice(source, destination, bus.getCategory())
                .orElseThrow(() -> new RuntimeException("Price not found for route and category"));
        int totalPrice = pricePerSeat * seats.size();

        // Create single ticket for all seats
        Ticket ticket = new Ticket();
        ticket.setBus(bus);
        ticket.setUser(user);
        ticket.setDate(date);
        ticket.setScheduledTime(time);
        ticket.setSource(source);
        ticket.setDestination(destination);
        ticket.setBookingTime(LocalTime.now());
        ticket.setStatus("BOOKED");
        ticket.setPrice(totalPrice);
        ticket.setSeats(seats);
        ticket.generateTicketCode();

        Ticket savedTicket = ticketRepository.save(ticket);

        // Update seat availability
        for (String seat : seats) {
            bookedSeats.put(seat, savedTicket.getTicketId().longValue());
        }
        seatAvailability.setBookedSeats(bookedSeats);
        seatAvailability.setAvailableSeats(seatAvailability.getAvailableSeats() - seats.size());
        seatAvailabilityRepository.save(seatAvailability);

        return savedTicket;
    }
}