package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.*;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.TimeMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.BusTopia.DTOs.BusInfo.BusInfoDto;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusService {
    private final BusRepository busRepository;
    private final RouteService routeService;
    private final PriceMappingRepository priceMappingRepository;
    private final TimeMappingRepository timeMappingRepository;
    private Clock clock = Clock.systemDefaultZone(); // default clock

    // Setter for test override
    public void setClock(Clock clock) {
        this.clock = clock;
    }

    public BusInfoDto getBusInfo(Integer busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        BusInfoDto dto = new BusInfoDto();

        // Basic Bus Info
        dto.setBusId(bus.getBusId());
        dto.setCompanyName(bus.getCompanyName());
        dto.setLicenseNo(bus.getLicenseNo());
        dto.setCategory(bus.getCategory());
        dto.setStartTime(bus.getStartTime());
        dto.setPhoto(bus.getPhoto());

        // Route Info
        Route route = bus.getRoute();
        List<String> stops = new ArrayList<>();
        if (route != null) {
            BusInfoDto.RouteDto routeDto = new BusInfoDto.RouteDto();
            routeDto.setRouteId(route.getRouteId());
            routeDto.setStops(route.getStops());
            dto.setRoute(routeDto);
            stops = route.getStops(); // Extract list of stops
        }

        // Seat Layout Info
        SeatLayout layout = bus.getSeatLayout();
        if (layout != null) {
            BusInfoDto.SeatLayoutDto layoutDto = new BusInfoDto.SeatLayoutDto();
            layoutDto.setLayoutId(layout.getLayoutId());
            layoutDto.setName(layout.getName());
            layoutDto.setCategory(layout.getCategory());
            layoutDto.setLayout(layout.getLayout());
            dto.setSeatLayout(layoutDto);
        }

        // Price mappings between consecutive stops
        List<BusInfoDto.PriceMappingDto> priceMappingDtos = new ArrayList<>();
        for (int i = 0; i < stops.size() - 1; i++) {
            String stop1 = stops.get(i);
            String stop2 = stops.get(i + 1);
            Optional<Integer> priceOpt = priceMappingRepository.getPrice(stop1, stop2, bus.getCategory());
            priceOpt.ifPresent(price -> {
                BusInfoDto.PriceMappingDto pdto = new BusInfoDto.PriceMappingDto();
                pdto.setStop1(stop1);
                pdto.setStop2(stop2);
                pdto.setCategory(bus.getCategory());
                pdto.setPrice(price);
                priceMappingDtos.add(pdto);
            });
        }
        dto.setPriceMappings(priceMappingDtos);

        // Time mappings between consecutive stops
        List<BusInfoDto.TimeMappingDto> timeMappingDtos = new ArrayList<>();
        for (int i = 0; i < stops.size() - 1; i++) {
            String stop1 = stops.get(i);
            String stop2 = stops.get(i + 1);
            Optional<Integer> durationOpt = timeMappingRepository.findDurationBetweenStops(stop1, stop2);
            durationOpt.ifPresent(duration -> {
                BusInfoDto.TimeMappingDto tdto = new BusInfoDto.TimeMappingDto();
                tdto.setStop1(stop1);
                tdto.setStop2(stop2);
                tdto.setDuration(duration);
                timeMappingDtos.add(tdto);
            });
        }
        dto.setTimeMappings(timeMappingDtos);

        return dto;
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

    public List<Bus> getBusesForStops(String stop1, String stop2) {
        // Get routes containing both source and destination
        List<Route> routes = routeService.getRoutesContainingSourceAndDestination(stop1, stop2);
        return busRepository.findByRouteIn(routes);
    }

    public List<Bus> getAvailableBuses(String source, String destination, LocalDate date, String category, int min_budget, int max_budget) {
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

