package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Route;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.TimeMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusService {
    private final BusRepository busRepository;
    private final RouteService routeService;
    private final TimeMappingRepository timeMappingRepository;
    private Clock clock = Clock.systemDefaultZone(); // default clock

    // Setter for test override
    public void setClock(Clock clock) {
        this.clock = clock;
    }

    public LocalTime getStartTimeForAStop(Bus bus, String stop) {
        // Get the bus's base start time
        LocalTime baseStartTime = bus.getStartTime();
        if (baseStartTime == null) {
            throw new IllegalStateException("Bus start time is not set");
        }

        // Get the route stops
        List<String> routeStops = bus.getRoute().getStops();
        if (routeStops == null || routeStops.isEmpty()) {
            throw new IllegalStateException("Route stops are not defined");
        }

        // Find the position of the source in the route
        int sourceIndex = routeStops.indexOf(stop);
        if (sourceIndex == -1) {
            throw new IllegalArgumentException("Source location not found in route");
        }

        // If source is the first stop, use the bus's start time directly
        if (sourceIndex == 0) {
            return baseStartTime;
        }

        // Calculate cumulative time from first stop to source
        Duration totalDuration = Duration.ZERO;

        for (int i = 0; i < sourceIndex; i++) {
            String currentStop = routeStops.get(i);
            String nextStop = routeStops.get(i + 1);

            // Find the time mapping between these stops
            Duration segmentDuration = timeMappingRepository
                    .findDurationBetweenStops(currentStop, nextStop)
                    .map(Duration::ofMinutes)
                    .orElseThrow(() -> new IllegalStateException(
                            String.format("No time mapping found between %s and %s", currentStop, nextStop)
                    ));

            totalDuration = totalDuration.plus(segmentDuration);
        }

        // Calculate scheduled time by adding duration to base start time
        return baseStartTime.plus(totalDuration);
    }

    public List<Bus> getAvailableBuses(String source, String destination, LocalDate date) {
        // Get routes containing both source and destination
        List<Route> routes = routeService.getRoutesContainingSourceAndDestination(source, destination);

        // Get current time and the threshold time (current time + 15 minutes)
        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime thresholdTime = now.plusMinutes(15);

        // Get buses for the routes and filter based on start time at source
        return busRepository.findByRouteIn(routes).stream()
                .filter(bus -> {
                    try {
                        // Get the start time at the source stop
                        LocalTime startTimeAtSource = getStartTimeForAStop(bus, source);
                        // Combine with the provided date to create a LocalDateTime
                        LocalDateTime departureDateTime = LocalDateTime.of(date, startTimeAtSource);
                        // Check if the departure time is at least 15 minutes after now
                        return !departureDateTime.isBefore(thresholdTime);
                    } catch (IllegalStateException | IllegalArgumentException e) {
                        // Skip buses with invalid data (e.g., missing start time or stops)
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }
}

