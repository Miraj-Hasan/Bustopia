package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.BuyTicket.BusSearchRequest;
import com.example.BusTopia.DTOs.BuyTicket.BusSearchResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
import com.example.BusTopia.MySqlRepositories.SeatAvailabilityMappingRepository;
import com.example.BusTopia.Services.BusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/buses")
@CrossOrigin(origins = "*")  // Configure as needed
@RequiredArgsConstructor
public class BusController {
    private final BusService busService;
    private final PriceMappingRepository priceMappingRepository;
    private final SeatAvailabilityMappingRepository seatAvailabilityRepository;

    @PostMapping("/available")
    public ResponseEntity<List<BusSearchResponse>> getAvailableBuses(@RequestBody BusSearchRequest request) {
        List<Bus> buses = busService.getAvailableBuses(request.getSource(), request.getDestination(), request.getDate(),
                request.getCategory(), request.getMin_budget(), request.getMax_budget());


        List<BusSearchResponse> responses = buses.stream().map(bus -> {
            LocalTime startTime = busService.getStartTimeForAStop(bus, request.getSource());

            int price = priceMappingRepository
                    .getPrice(request.getSource(), request.getDestination(), bus.getCategory())
                    .orElse(0);


            int availableSeats = seatAvailabilityRepository
                    .findByBusAndJourneyDate(bus, request.getDate())
                    .map(seatMap -> seatMap.getAvailableSeats())
                    .orElse(0); // Default to 0 if no mapping

            return new BusSearchResponse(
                    bus.getBusId(),
                    bus.getCompanyName(),
                    bus.getLicenseNo(),
                    bus.getCategory(),
                    request.getSource(),
                    request.getDestination(),
                    startTime,
                    price,
                    availableSeats,
                    bus.getRoute()
            );
        }).toList();

        List<BusSearchResponse> finalResponses = responses.stream().filter(bus -> {
            boolean priceOkay = bus.getPrice() >= request.getMin_budget() && bus.getPrice() <= request.getMax_budget();
            boolean catOkay = request.getCategory().equals("") || bus.getCategory().equalsIgnoreCase(request.getCategory());
            return priceOkay && catOkay;
        }).toList();

        return ResponseEntity.ok(finalResponses);
    }
}
