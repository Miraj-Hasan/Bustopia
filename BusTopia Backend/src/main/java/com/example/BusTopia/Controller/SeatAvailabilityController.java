package com.example.BusTopia.Controller;

import com.example.BusTopia.DatabaseEntity.SeatAvailabilityMapping;
import com.example.BusTopia.MySqlRepositories.SeatAvailabilityMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SeatController {

    private final SeatAvailabilityMappingRepository seatRepo;

    @GetMapping("/seats")
    public ResponseEntity<Map<String, Long>> getBookedSeats(
            @RequestParam Integer busId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        var toret = seatRepo.findByBus_BusIdAndJourneyDate(busId, date)
                .map(mapping -> ResponseEntity.ok(mapping.getBookedSeats()))
                .orElse(ResponseEntity.notFound().build());
        System.out.println(toret);
        return toret;
    }
}
