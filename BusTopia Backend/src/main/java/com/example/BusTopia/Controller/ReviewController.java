package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DTOs.Review.BusInfoAndReviewResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.Services.ReviewService;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<?> getSpecificCompanyBuses(@Valid
                                                     @RequestParam String companyName,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size
                                                 ) {
        Page<BusDTOResponse> busList = reviewService.getAllBusesOfACompanyDTO(companyName, page, size);
        return ResponseEntity.ok(busList);
    }

    @GetMapping("/getReviewsByBusId")
    public ResponseEntity<?> getReviewsByBusId(@Valid @RequestParam int busId) {
        List<Review> reviews = reviewService.getReviewsByBusId(busId);
        System.out.println("reviews: " + reviews );
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/getReviewsByLicenseNo")
    public ResponseEntity<?> getReviewsByLicenseNo(@Valid @RequestParam String licenseNo) {
        System.out.println("License no got: " + licenseNo);
        BusInfoAndReviewResponse response = reviewService.getReviewsByLicenseNo(licenseNo);
        System.out.println("final response: " + response);
        return ResponseEntity.ok(response);
    }
}
