package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.BuyTicket.BusSearchRequest;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.Services.BusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/buses")
@CrossOrigin(origins = "*")  // Configure as needed
public class BusController {
    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @PostMapping("/available")
    public ResponseEntity<List<Bus>> getAvailableBuses(@RequestBody BusSearchRequest request) {
        List<Bus> buses = busService.getAvailableBuses(request.getSource(), request.getDestination(), request.getDate());
        System.out.println(buses);
        return ResponseEntity.ok(buses);
    }
}
