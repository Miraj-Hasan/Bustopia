package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.Homepage.BusForRouteDTO;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
import com.example.BusTopia.MySqlRepositories.SeatAvailabilityMappingRepository;
import com.example.BusTopia.Services.BusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/home")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HomePageController {
    private final BusService busService;
    private final PriceMappingRepository priceMappingRepository;
    private final SeatAvailabilityMappingRepository seatAvailabilityRepository;
    private final BusRepository busRepository;

    @GetMapping("/route")
    public ResponseEntity<List<BusForRouteDTO>> getBusesByRoute(
            @RequestParam String source,
            @RequestParam String destination) {

        List<Bus> buses = busService.getBusesForStops(source, destination);
        List<BusForRouteDTO> response = buses.stream()
                .map(bus -> new BusForRouteDTO(
                        bus.getBusId(),
                        bus.getCompanyName(),
                        bus.getCategory(),
                        busService.getStartTimeForAStop(bus, source),
                        bus.getLicenseNo()
                ))
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/company")
    public ResponseEntity<List<Bus>> getBusesByCompany(
            @RequestParam String companyName) {
        List<Bus> buses = busRepository.findByCompanyNameIgnoreCase(companyName);
        return ResponseEntity.ok(buses);
    }
}
