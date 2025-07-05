package com.example.BusTopia.Controller;

import com.example.BusTopia.Services.SeatAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/seat-availability")
public class SeatAvailabilityController {

    @Autowired
    private SeatAvailabilityService seatAvailabilityService;

    // Get booked seats for a specific bus ID and journey date
    @GetMapping("/bus/{busId}/date/{journeyDate}")
    public ResponseEntity<Map<String, Long>> getBookedSeats(
            @PathVariable Integer busId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate journeyDate) {
        return seatAvailabilityService.getBookedSeatsByBusIdAndDate(busId, journeyDate)
                .map(bookedSeats -> ResponseEntity.ok(bookedSeats))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}