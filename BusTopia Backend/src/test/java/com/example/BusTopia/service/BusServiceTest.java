package com.example.BusTopia.service;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Route;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.TimeMappingRepository;
import com.example.BusTopia.Services.BusService;
import com.example.BusTopia.Services.RouteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusServiceTest {

    @Mock
    private BusRepository busRepository;

    @Mock
    private RouteService routeService;

    @Mock
    private TimeMappingRepository timeMappingRepository;

    @InjectMocks
    private BusService busService;

    @Test
    void getStartTimeForAStop_ShouldReturnCorrectTimeForFirstStop() {
        // Arrange
        Bus bus = new Bus();
        bus.setStartTime(LocalTime.of(8, 0));

        Route route = new Route();
        route.setStops(List.of("Dhaka", "Comilla", "Chittagong"));
        bus.setRoute(route);

        // Act
        LocalTime result = busService.getStartTimeForAStop(bus, "Dhaka");

        // Assert
        assertEquals(LocalTime.of(8, 0), result);
        verifyNoInteractions(timeMappingRepository);
    }

    @Test
    void getStartTimeForAStop_ShouldReturnCorrectTimeForLaterStop() {
        // Arrange
        Bus bus = new Bus();
        bus.setStartTime(LocalTime.of(8, 0));

        Route route = new Route();
        route.setStops(List.of("Dhaka", "Comilla", "Chittagong"));
        bus.setRoute(route);

        when(timeMappingRepository.findDurationBetweenStops("Dhaka", "Comilla"))
                .thenReturn(Optional.of(120)); // 120 minutes = 2 hours

        // Act
        LocalTime result = busService.getStartTimeForAStop(bus, "Comilla");

        // Assert
        assertEquals(LocalTime.of(10, 0), result);
        verify(timeMappingRepository, times(1)).findDurationBetweenStops("Dhaka", "Comilla");
    }

    @Test
    void getStartTimeForAStop_ShouldThrowExceptionWhenStopNotFound() {
        // Arrange
        Bus bus = new Bus();
        bus.setStartTime(LocalTime.of(8, 0));

        Route route = new Route();
        route.setStops(List.of("Dhaka", "Comilla", "Chittagong"));
        bus.setRoute(route);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            busService.getStartTimeForAStop(bus, "InvalidStop");
        });
    }


    @Test
    void getAvailableBuses_ShouldExcludeBusesWithInvalidData() {
        // Arrange
        String source = "Dhaka";
        String destination = "Chittagong";
        LocalDate date = LocalDate.now().plusDays(1);

        Route route = new Route();
        route.setStops(List.of("Dhaka", "Comilla", "Chittagong"));

        when(routeService.getRoutesContainingSourceAndDestination(source, destination))
                .thenReturn(List.of(route));

        Bus validBus = new Bus();
        validBus.setBusId(1);
        validBus.setRoute(route);
        validBus.setStartTime(LocalTime.of(10, 0));

        Bus invalidBus = new Bus(); // No start time
        invalidBus.setBusId(2);
        invalidBus.setRoute(route);

        when(busRepository.findByRouteIn(List.of(route)))
                .thenReturn(List.of(validBus, invalidBus));

        // Set a fixed clock for testing
        LocalDateTime now = LocalDateTime.of(date.minusDays(1), LocalTime.of(9, 0));
        Clock fixedClock = Clock.fixed(now.toInstant(ZoneOffset.UTC), ZoneId.systemDefault());
        busService.setClock(fixedClock);

        // Act
        List<Bus> result = busService.getAvailableBuses(source, destination, date, "AC", 0, 10);

        // Assert
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getBusId());

        verify(routeService, times(1)).getRoutesContainingSourceAndDestination(source, destination);
        verify(busRepository, times(1)).findByRouteIn(List.of(route));
    }
}