package com.example.BusTopia.Schedulers;

import com.example.BusTopia.DTOs.RerouteInfo;
import com.example.BusTopia.DatabaseEntity.*;
import com.example.BusTopia.MySqlRepositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemandBasedFrequencyScheduler {

    private final TicketRepository ticketRepo;
    private final BusRepository busRepo;
    private final RouteRepository routeRepo;
    private final DemandAdjusterConfigRepository configRepo;

    // Run at 3 AM on the 1st of every month
    @Scheduled(cron = "0 0 3 1 * *")
    @Transactional
    public List<RerouteInfo> adjustBusFrequencies() {
        List<RerouteInfo> reroutedBuses = new ArrayList<>();

        DemandAdjusterConfig config = configRepo.findById(1L).orElseThrow();

        int X = config.getRerouteCount();
        int lowThreshold = config.getUnderperformThreshold();
        int highThreshold = config.getHighDemandThreshold();

        List<Ticket> recentTickets = ticketRepo.findAllByDateAfter(LocalDate.now().minusDays(30));

        // Step 1: Count seats sold per bus
        Map<Integer, Integer> busSeatCount = new HashMap<>();
        for (Ticket ticket : recentTickets) {
            if (ticket.getBus() != null) {
                int busId = ticket.getBus().getBusId();
                int seats = ticket.getSeats() != null ? ticket.getSeats().size() : 0;
                busSeatCount.put(busId, busSeatCount.getOrDefault(busId, 0) + seats);
            }
        }

        // Step 2: Find all buses with low performance
        List<Bus> allBuses = busRepo.findAll();
        List<Bus> lowPerformingBuses = allBuses.stream()
                .filter(b -> busSeatCount.getOrDefault(b.getBusId(), 0) <= lowThreshold)
                .sorted(Comparator.comparingInt(b -> busSeatCount.getOrDefault(b.getBusId(), 0)))
                .toList();

        // Step 3: Count demand per route
        Map<Integer, Integer> routeDemandMap = new HashMap<>();
        for (Ticket ticket : recentTickets) {
            if (ticket.getBus() != null && ticket.getBus().getRoute() != null) {
                int routeId = ticket.getBus().getRoute().getRouteId();
                int seats = ticket.getSeats() != null ? ticket.getSeats().size() : 0;
                routeDemandMap.put(routeId, routeDemandMap.getOrDefault(routeId, 0) + seats);
            }
        }

        // Step 4: Get high-demand route IDs
        List<Integer> highDemandRouteIds = routeDemandMap.entrySet().stream()
                .filter(e -> e.getValue() >= highThreshold)
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .toList();

        if (highDemandRouteIds.isEmpty()) {
            return reroutedBuses; // nothing to do
        }

        for(int i : highDemandRouteIds) System.out.println(i);
        // Step 5: Pick X eligible low-performing buses not already in a high-demand route
        List<Bus> eligibleBuses = lowPerformingBuses.stream()
                .filter(bus -> bus.getRoute() == null || !highDemandRouteIds.contains(bus.getRoute().getRouteId()))
                .limit(X)
                .toList();

        // Step 6: Evenly distribute eligible buses among high-demand routes
        int routeCount = highDemandRouteIds.size();
        for (int i = 0; i < eligibleBuses.size(); i++) {
            Bus bus = eligibleBuses.get(i);
            int targetRouteId = highDemandRouteIds.get(i % routeCount);
            Route newRoute = routeRepo.findById(targetRouteId).orElse(null);

            if (newRoute != null) {
                int oldRouteId = bus.getRoute() != null ? bus.getRoute().getRouteId() : -1;
                bus.setRoute(newRoute);
                busRepo.save(bus);

                reroutedBuses.add(new RerouteInfo(
                        bus.getBusId(),
                        bus.getCompanyName(),
                        oldRouteId,
                        newRoute.getRouteId()
                ));
            }
        }

        return reroutedBuses;
    }
}
