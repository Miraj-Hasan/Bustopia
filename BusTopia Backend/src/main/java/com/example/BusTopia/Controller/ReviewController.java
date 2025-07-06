package com.example.BusTopia.Controller;

import com.example.BusTopia.AwsConfiguration.AwsFileUpload;
import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DTOs.Review.BusInfoAndReviewResponse;
import com.example.BusTopia.DTOs.Review.ReviewDTOResponse;
import com.example.BusTopia.DTOs.Review.ReviewRequest;
import com.example.BusTopia.Services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;
    private final AwsFileUpload awsFileUpload;

    public ReviewController(ReviewService reviewService, AwsFileUpload awsFileUpload) {
        this.reviewService = reviewService;
        this.awsFileUpload = awsFileUpload;
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
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam int userId
                                                 ) {
        Page<BusDTOResponse> busList = reviewService.getAllBusesOfACompanyDTO(companyName, page, size, userId);
        return ResponseEntity.ok(busList);
    }

    @GetMapping("/getReviewsByBusId")
    public ResponseEntity<?> getReviewsByBusId(@Valid @RequestParam int busId) {
        List<ReviewDTOResponse> reviews = reviewService.getReviewsByBusId(busId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/getReviewsByLicenseNo")
    public ResponseEntity<?> getReviewsByLicenseNo(@Valid @RequestParam String licenseNo, @RequestParam int userId) {
        BusInfoAndReviewResponse response = reviewService.getReviewsByLicenseNo(licenseNo, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getTravelledBuses")
    public ResponseEntity<?> getTravelledBuses(@Valid @RequestParam int userId ) {
        List<BusDTOResponse> busList = reviewService.getTravelledBuses(userId);
        return ResponseEntity.ok(busList);
    }

    @PostMapping("/reviews/uploadReviewImages")
    public ResponseEntity<?> uploadReviewImages(@RequestParam ("images")List<MultipartFile> images) {
        try {
            List<String> imageUrls = awsFileUpload.uploadMultipleFiles(images);
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload images: " + e.getMessage());
        }
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> submitReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            ReviewDTOResponse response = reviewService.submitReview(reviewRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            // return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
