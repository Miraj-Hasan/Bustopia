package com.example.BusTopia.controller;

import com.example.BusTopia.Controller.BusController;
import com.example.BusTopia.DTOs.BuyTicket.BusSearchRequest;
import com.example.BusTopia.DTOs.BuyTicket.BusSearchResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Route;
import com.example.BusTopia.Services.BusService;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
import com.example.BusTopia.MySqlRepositories.SeatAvailabilityMappingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusControllerTest {

    @Mock
    private BusService busService;

    @Mock
    private PriceMappingRepository priceMappingRepository;

    @Mock
    private SeatAvailabilityMappingRepository seatAvailabilityRepository;

    @InjectMocks
    private BusController busController;

    @Test
    void getAvailableBuses_ShouldReturnOneACBusWithinBudget() {
        // Arrange
        BusSearchRequest request = new BusSearchRequest(
                "Dhaka", "Chittagong", LocalDate.now(), "AC", 1000, 1300); // budget allows 1200

        Route route = new Route();
        route.setStops(List.of("Dhaka", "Comilla", "Chittagong"));

        Bus bus1 = new Bus();
        bus1.setBusId(1);
        bus1.setCompanyName("Green Line");
        bus1.setLicenseNo("GL-1234");
        bus1.setCategory("AC");
        bus1.setRoute(route);
        bus1.setStartTime(LocalTime.of(8, 0));

        // Only bus1 is returned as it's AC and within budget
        when(busService.getAvailableBuses(
                "Dhaka", "Chittagong", request.getDate(), "AC", 1000, 1300))
                .thenReturn(List.of(bus1));

        when(priceMappingRepository.getPrice("Dhaka", "Chittagong", "AC"))
                .thenReturn(Optional.of(1200));

        when(seatAvailabilityRepository.findByBusAndJourneyDate(bus1, request.getDate()))
                .thenReturn(Optional.empty());

        when(busService.getStartTimeForAStop(bus1, "Dhaka"))
                .thenReturn(LocalTime.of(8, 0));

        // Act
        ResponseEntity<List<BusSearchResponse>> response = busController.getAvailableBuses(request);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());

        List<BusSearchResponse> buses = response.getBody();
        assertNotNull(buses);
        assertEquals(1, buses.size());

        BusSearchResponse busResponse = buses.get(0);
        assertEquals(1, busResponse.getBusId());
        assertEquals("Green Line", busResponse.getCompanyName());
        assertEquals("GL-1234", busResponse.getLicenseNo());
        assertEquals("AC", busResponse.getCategory());
        assertEquals("Dhaka", busResponse.getSource());
        assertEquals("Chittagong", busResponse.getDestination());
        assertEquals(1200, busResponse.getPrice());
        assertEquals(0, busResponse.getAvailableSeats()); // no existing seat availability

        // Verifications
        verify(busService, times(1))
                .getAvailableBuses("Dhaka", "Chittagong", request.getDate(), "AC", 1000, 1300);
        verify(priceMappingRepository, times(1))
                .getPrice("Dhaka", "Chittagong", "AC");
        verify(seatAvailabilityRepository, times(1))
                .findByBusAndJourneyDate(bus1, request.getDate());
        verify(busService, times(1))
                .getStartTimeForAStop(bus1, "Dhaka");
    }


    @Test
    void getAvailableBuses_ShouldHandleNoAvailableBuses() {
        // Arrange
        BusSearchRequest request = new BusSearchRequest(
                "Dhaka", "Chittagong", LocalDate.now().plusDays(1), "AC", 0, 10
        );

        when(busService.getAvailableBuses("Dhaka", "Chittagong", request.getDate(), "AC", 0, 10))
                .thenReturn(List.of());

        // Act
        ResponseEntity<List<BusSearchResponse>> response = busController.getAvailableBuses(request);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<BusSearchResponse> buses = response.getBody();
        assertNotNull(buses);
        assertTrue(buses.isEmpty());

        verify(busService, times(1)).getAvailableBuses("Dhaka", "Chittagong", request.getDate(), "AC", 0, 10);
        verifyNoMoreInteractions(busService, priceMappingRepository, seatAvailabilityRepository);
    }
}