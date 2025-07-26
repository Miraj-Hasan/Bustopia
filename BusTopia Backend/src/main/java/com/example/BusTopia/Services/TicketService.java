package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.SeatAvailabilityMapping;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.BusTopia.DTOs.Admin.TicketSalesResponse;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.example.BusTopia.DatabaseEntity.Review;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final BusRepository busRepository;
    private final UserRepository userRepository;
    private final TimeMappingRepository timeMappingRepository;
    private final PriceMappingRepository priceMappingRepository;
    private final SeatAvailabilityMappingRepository seatAvailabilityRepository;
    private final ReviewRepository reviewRepository;

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

    @Transactional
    public void cancelTicket(Integer ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        // Update seat availability mapping
        SeatAvailabilityMapping seatAvailability = seatAvailabilityRepository
                .findByBus_BusIdAndJourneyDate(ticket.getBus().getBusId(), ticket.getDate())
                .orElseThrow(() -> new RuntimeException("Seat availability mapping not found"));
        Map<String, Long> bookedSeats = seatAvailability.getBookedSeats();
        for (String seat : ticket.getSeats()) {
            bookedSeats.remove(seat);
        }
        seatAvailability.setBookedSeats(bookedSeats);
        seatAvailability.setAvailableSeats(seatAvailability.getAvailableSeats() + ticket.getSeats().size());
        seatAvailabilityRepository.save(seatAvailability);
        // Delete the ticket
        ticketRepository.delete(ticket);
    }

    public List<Ticket> getTicketsByUser(UserEntity user) {
        try {
            return ticketRepository.findByUser(user);
        }catch (Exception e){
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private Long toLong(Object o) {
        if (o instanceof Long) return (Long) o;
        if (o instanceof Integer) return ((Integer) o).longValue();
        if (o instanceof BigInteger) return ((BigInteger) o).longValue();
        if (o == null) return 0L;
        throw new IllegalArgumentException("Cannot convert " + o + " to Long");
    }

    public List<TicketSalesResponse> getTicketSalesForAdmin() {
        List<Object[]> results = ticketRepository.getTicketSalesByRouteWithPrice();
        return results.stream()
                .map(row -> new TicketSalesResponse(
                        (String) row[0],
                        (String) row[1],
                        row[2] instanceof BigDecimal ? ((BigDecimal) row[2]).doubleValue() : (Double) row[2],
                        toLong(row[3]),
                        toDouble(row[4])
                ))
                .toList();
    }

    public List<Map<String, Object>> getAllTicketsForAnalytics() {
        List<Ticket> tickets = ticketRepository.findAll();
        return tickets.stream()
                .map(ticket -> {
                    Map<String, Object> ticketData = new HashMap<>();
                    ticketData.put("ticketId", ticket.getTicketId());
                    ticketData.put("companyName", ticket.getBus().getCompanyName());
                    ticketData.put("price", ticket.getPrice());
                    ticketData.put("source", ticket.getSource());
                    ticketData.put("destination", ticket.getDestination());
                    ticketData.put("date", ticket.getDate());
                    ticketData.put("status", ticket.getStatus());
                    return ticketData;
                })
                .toList();
    }

    public List<Map<String, Object>> getAllReviewsForAnalytics() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream()
                .map(review -> {
                    Map<String, Object> reviewData = new HashMap<>();
                    reviewData.put("reviewId", review.getReviewId());
                    reviewData.put("message", review.getMessage());
                    reviewData.put("stars", review.getStars());
                    reviewData.put("reviewTime", review.getReviewTime());
                    reviewData.put("companyName", review.getBus().getCompanyName());
                    reviewData.put("licenseNo", review.getBus().getLicenseNo());
                    return reviewData;
                })
                .toList();
    }

    private Double toDouble(Object o) {
        if (o instanceof Double) return (Double) o;
        if (o instanceof Long) return ((Long) o).doubleValue();
        if (o instanceof Integer) return ((Integer) o).doubleValue();
        if (o instanceof BigDecimal) return ((BigDecimal) o).doubleValue();
        if (o == null) return 0.0;
        throw new IllegalArgumentException("Cannot convert " + o + " to Double");
    }
}