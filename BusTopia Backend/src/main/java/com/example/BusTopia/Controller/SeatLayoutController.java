package com.example.BusTopia.Controller;

import com.example.BusTopia.DatabaseEntity.SeatLayout;
import com.example.BusTopia.Services.SeatLayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seat-layouts")
public class SeatLayoutController {

    @Autowired
    private SeatLayoutService seatLayoutService;

    // Get seat layout for a specific bus ID
    @GetMapping("/bus/{busId}")
    public ResponseEntity<SeatLayout> getSeatLayoutByBusId(@PathVariable Integer busId) {
        return seatLayoutService.getSeatLayoutByBusId(busId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}