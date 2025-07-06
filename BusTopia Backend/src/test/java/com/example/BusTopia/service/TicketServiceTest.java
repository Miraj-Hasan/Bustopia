package com.example.BusTopia.service;

import com.example.BusTopia.DatabaseEntity.*;
import com.example.BusTopia.MySqlRepositories.*;
import com.example.BusTopia.Services.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private BusRepository busRepository;
    @Mock private UserRepository userRepository;
    @Mock private PriceMappingRepository priceMappingRepository;
    @Mock private SeatAvailabilityMappingRepository seatAvailabilityRepository;

    @InjectMocks private TicketService ticketService;

    private Bus mockBus;
    private UserEntity mockUser;
    private List<String> seatList;
    private LocalDate journeyDate;
    private LocalTime scheduledTime;

    @BeforeEach
    void setup() {
        journeyDate = LocalDate.of(2025, 7, 7);
        scheduledTime = LocalTime.of(9, 0);
        seatList = List.of("A1", "A2");

        mockBus = new Bus();
        mockBus.setBusId(1);
        mockBus.setCategory("AC");
        SeatLayout layout = new SeatLayout();
        layout.setLayout(List.of(
                List.of("A1", "A2", "", ""),
                List.of("B1", "B2", "", "")
        ));
        layout.setName("AC Standard 2+2");
        layout.setCategory("AC");

        mockBus.setSeatLayout(layout);

        mockUser = new UserEntity();
        mockUser.setId(10L);
        mockUser.setName("John Doe");
    }

    @Test
    void bookTicket_ShouldSucceed_WhenValidInput() {
        SeatAvailabilityMapping mapping = new SeatAvailabilityMapping();
        mapping.setBookedSeats(new HashMap<>());
        mapping.setAvailableSeats(20);
        mapping.setTotalSeats(20);
        mapping.setBus(mockBus);
        mapping.setJourneyDate(journeyDate);

        when(busRepository.findById(1)).thenReturn(Optional.of(mockBus));
        when(userRepository.findById(10L)).thenReturn(Optional.of(mockUser));
        when(seatAvailabilityRepository.findByBus_BusIdAndJourneyDate(1, journeyDate))
                .thenReturn(Optional.of(mapping));
        when(priceMappingRepository.getPrice("Dhaka", "Chittagong", "AC"))
                .thenReturn(Optional.of(500));
        when(ticketRepository.save(any(Ticket.class)))
                .thenAnswer(invocation -> {
                    Ticket t = invocation.getArgument(0);
                    t.setTicketId(123);  // mock ID generation
                    return t;
                });

        Ticket ticket = ticketService.bookTicket(10L, 1, journeyDate, scheduledTime,
                "Dhaka", "Chittagong", seatList);

        assertEquals("Dhaka", ticket.getSource());
        assertEquals(1000, ticket.getPrice());
        assertEquals(2, ticket.getSeats().size());
        verify(seatAvailabilityRepository).save(any(SeatAvailabilityMapping.class));
    }

    @Test
    void bookTicket_ShouldFail_WhenNoSeatsSelected() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ticketService.bookTicket(10L, 1, journeyDate, scheduledTime,
                        "Dhaka", "Chittagong", new ArrayList<>())
        );
        assertEquals("At least one seat must be selected.", ex.getMessage());
    }

    @Test
    void bookTicket_ShouldFail_WhenMoreThanFourSeatsSelected() {
        List<String> seats = List.of("A1", "A2", "B1", "B2", "C1");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ticketService.bookTicket(10L, 1, journeyDate, scheduledTime,
                        "Dhaka", "Chittagong", seats)
        );
        assertEquals("Cannot book more than 4 seats.", ex.getMessage());
    }

    @Test
    void bookTicket_ShouldFail_WhenBusNotFound() {
        when(busRepository.findById(1)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ticketService.bookTicket(10L, 1, journeyDate, scheduledTime,
                        "Dhaka", "Chittagong", seatList)
        );
        assertEquals("Bus not found", ex.getMessage());
    }

    @Test
    void bookTicket_ShouldFail_WhenUserNotFound() {
        when(busRepository.findById(1)).thenReturn(Optional.of(mockBus));
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ticketService.bookTicket(10L, 1, journeyDate, scheduledTime,
                        "Dhaka", "Chittagong", seatList)
        );
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void bookTicket_ShouldFail_WhenSeatAlreadyBooked() {
        Map<String, Long> bookedSeats = new HashMap<>();
        bookedSeats.put("A1", 99L);

        SeatAvailabilityMapping mapping = new SeatAvailabilityMapping();
        mapping.setBookedSeats(bookedSeats);
        mapping.setAvailableSeats(20);
        mapping.setBus(mockBus);
        mapping.setJourneyDate(journeyDate);

        when(busRepository.findById(1)).thenReturn(Optional.of(mockBus));
        when(userRepository.findById(10L)).thenReturn(Optional.of(mockUser));
        when(seatAvailabilityRepository.findByBus_BusIdAndJourneyDate(1, journeyDate))
                .thenReturn(Optional.of(mapping));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ticketService.bookTicket(10L, 1, journeyDate, scheduledTime,
                        "Dhaka", "Chittagong", seatList)
        );
        assertEquals("Seat A1 is already booked.", ex.getMessage());
    }
}
