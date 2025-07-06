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
    void getAvailableBuses_ShouldReturnListOfBuses() {
        // Arrange
        BusSearchRequest request = new BusSearchRequest(
                "Dhaka", "Chittagong", LocalDate.now().plusDays(1)
        );

        Route route = new Route();
        route.setStops(List.of("Dhaka", "Comilla", "Chittagong"));

        Bus bus1 = new Bus();
        bus1.setBusId(1);
        bus1.setCompanyName("Green Line");
        bus1.setLicenseNo("GL-1234");
        bus1.setCategory("AC");
        bus1.setRoute(route);
        bus1.setStartTime(LocalTime.of(8, 0));

        Bus bus2 = new Bus();
        bus2.setBusId(2);
        bus2.setCompanyName("Shohagh");
        bus2.setLicenseNo("SH-5678");
        bus2.setCategory("Non-AC");
        bus2.setRoute(route);
        bus2.setStartTime(LocalTime.of(10, 30));

        when(busService.getAvailableBuses("Dhaka", "Chittagong", request.getDate()))
                .thenReturn(List.of(bus1, bus2));

        when(priceMappingRepository.getPrice("Dhaka", "Chittagong", "AC"))
                .thenReturn(Optional.of(1200));
        when(priceMappingRepository.getPrice("Dhaka", "Chittagong", "Non-AC"))
                .thenReturn(Optional.of(800));

        when(seatAvailabilityRepository.findByBusAndJourneyDate(bus1, request.getDate()))
                .thenReturn(Optional.empty());
        when(seatAvailabilityRepository.findByBusAndJourneyDate(bus2, request.getDate()))
                .thenReturn(Optional.empty());

        // Act
        ResponseEntity<List<BusSearchResponse>> response = busController.getAvailableBuses(request);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<BusSearchResponse> buses = response.getBody();
        assertNotNull(buses);
        assertEquals(2, buses.size());

        BusSearchResponse response1 = buses.get(0);
        assertEquals(1, response1.getBusId());
        assertEquals("Green Line", response1.getCompanyName());
        assertEquals("GL-1234", response1.getLicenseNo());
        assertEquals("AC", response1.getCategory());
        assertEquals("Dhaka", response1.getSource());
        assertEquals("Chittagong", response1.getDestination());
        assertEquals(1200, response1.getPrice());
        assertEquals(0, response1.getAvailableSeats());

        BusSearchResponse response2 = buses.get(1);
        assertEquals(2, response2.getBusId());
        assertEquals("Shohagh", response2.getCompanyName());
        assertEquals("SH-5678", response2.getLicenseNo());
        assertEquals("Non-AC", response2.getCategory());
        assertEquals("Dhaka", response2.getSource());
        assertEquals("Chittagong", response2.getDestination());
        assertEquals(800, response2.getPrice());
        assertEquals(0, response2.getAvailableSeats());

        verify(busService, times(1)).getAvailableBuses("Dhaka", "Chittagong", request.getDate());
        verify(busService, times(1)).getStartTimeForAStop(bus1, "Dhaka");
        verify(busService, times(1)).getStartTimeForAStop(bus2, "Dhaka");
        verify(priceMappingRepository, times(1)).getPrice("Dhaka", "Chittagong", "AC");
        verify(priceMappingRepository, times(1)).getPrice("Dhaka", "Chittagong", "Non-AC");
        verify(seatAvailabilityRepository, times(1)).findByBusAndJourneyDate(bus1, request.getDate());
        verify(seatAvailabilityRepository, times(1)).findByBusAndJourneyDate(bus2, request.getDate());
    }

    @Test
    void getAvailableBuses_ShouldHandleNoAvailableBuses() {
        // Arrange
        BusSearchRequest request = new BusSearchRequest(
                "Dhaka", "Chittagong", LocalDate.now().plusDays(1)
        );

        when(busService.getAvailableBuses("Dhaka", "Chittagong", request.getDate()))
                .thenReturn(List.of());

        // Act
        ResponseEntity<List<BusSearchResponse>> response = busController.getAvailableBuses(request);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        List<BusSearchResponse> buses = response.getBody();
        assertNotNull(buses);
        assertTrue(buses.isEmpty());

        verify(busService, times(1)).getAvailableBuses("Dhaka", "Chittagong", request.getDate());
        verifyNoMoreInteractions(busService, priceMappingRepository, seatAvailabilityRepository);
    }
}