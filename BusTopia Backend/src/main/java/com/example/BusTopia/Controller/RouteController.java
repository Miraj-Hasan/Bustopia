package com.example.BusTopia.Controller;

import com.example.BusTopia.Services.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RouteController {
    private final RouteService routeService;

    @GetMapping("/all_stops")
    public ResponseEntity<List<String>> getAllStops() {
        return ResponseEntity.ok(routeService.getAllStops());
    }

    @GetMapping("/destinations")
    public ResponseEntity<List<String>> getDestinationsForSource(@RequestParam String source) {
        List<String> destinations = routeService.getDestinationsForSource(source);
        return ResponseEntity.ok(destinations);
    }
}
