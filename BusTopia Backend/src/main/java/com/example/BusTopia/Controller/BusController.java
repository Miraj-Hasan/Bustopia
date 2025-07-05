package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.BuyTicket.BusSearchRequest;
import com.example.BusTopia.DTOs.BuyTicket.BusSearchResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
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

    @PostMapping("/available")
    public ResponseEntity<List<BusSearchResponse>> getAvailableBuses(@RequestBody BusSearchRequest request) {
        List<Bus> buses = busService.getAvailableBuses(request.getSource(), request.getDestination(), request.getDate());

        List<BusSearchResponse> responses = buses.stream().map(bus -> {
            LocalTime startTime = busService.getStartTimeForAStop(bus, request.getSource());
            int price = priceMappingRepository.getPrice(request.getSource(), request.getDestination(), bus.getCategory())
                    .orElse(0);

            return new BusSearchResponse(
                    bus.getBusId(),
                    bus.getCompanyName(),
                    bus.getLicenseNo(),
                    bus.getCategory(),
                    request.getSource(),
                    request.getDestination(),
                    startTime,
                    price,
                    bus.getRoute()
            );
        }).toList();

        return ResponseEntity.ok(responses);
    }
}
