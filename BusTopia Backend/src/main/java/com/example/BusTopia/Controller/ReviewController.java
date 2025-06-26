package com.example.BusTopia.Controller;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.Services.ReviewService;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/getAllCompanies")
    public ResponseEntity<?> getAllCompanies() {
        List<String> companyList = reviewService.getAllCompanyNames();
        return ResponseEntity.ok(companyList);
    }

    @GetMapping("/getSpecificCompanyBuses")
    public ResponseEntity<?> getSpecificCompanyBuses(@Valid @RequestParam String companyName) {
        System.out.println("🚀 Received request for company: " + companyName);
        List<Bus> busList = reviewService.getAllBusesOfACompany(companyName);
        System.out.println("📦 Found " + busList.size() + " buses for " + companyName);
        return ResponseEntity.ok(busList);
    }

}
