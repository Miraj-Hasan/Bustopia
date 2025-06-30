package com.example.BusTopia.Services;

import com.example.BusTopia.AwsConfiguration.AwsFileUpload;
import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DTOs.Review.BusInfoAndReviewResponse;
import com.example.BusTopia.DTOs.Review.ReviewDTOResponse;
import com.example.BusTopia.DTOs.Review.ReviewRequest;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.ReviewRepository;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {
    private final BusRepository busRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AwsFileUpload awsFileUpload;

    @Value("${backend.origin}")
    private String backendUrl;

    public ReviewService(BusRepository busRepository, UserRepository userRepository, UserRepository userRepository1, ReviewRepository reviewRepository, AwsFileUpload awsFileUpload) {
        this.busRepository = busRepository;
        this.userRepository = userRepository1;
        this.reviewRepository = reviewRepository;
        this.awsFileUpload = awsFileUpload;
    }

    public List<String> getAllCompanyNames() {
        return busRepository.findDistinctCompanyNames();
    }

    public Page<BusDTOResponse> getAllBusesOfACompanyDTO(String companyName, int page, int size, int userId) {
        Page<Bus> busPage = busRepository.findSpecificCompanyBus(companyName, PageRequest.of(page, size));

        return busPage.map(bus -> new BusDTOResponse(
                        bus.getBusId(),
                        bus.getCompanyName(),
                        bus.getLicenseNo(),
                        bus.getCategory(),
                        bus.getStartTime(),
                        backendUrl + "/" + bus.getPhoto(),
                        bus.getRoute() != null ? bus.getRoute().getStops() : List.of(),
                        busRepository.existsTicketByUserIdAndBusId(userId, bus.getBusId())
                ));
    }

    public List<ReviewDTOResponse> getReviewsByBusId(int busId) {
        List<Review> reviewList = busRepository.findByBusId(busId);
        List<ReviewDTOResponse> reviews;
        reviews = reviewList.stream()
                .map(review -> new ReviewDTOResponse(
                        review.getMessage(),
                        review.getUser().getId(),
                        review.getUser().getImageUrl(),
                        review.getReviewTime(),
                        review.getStars(),
                        review.getImages(),
                        review.getUser().getName()
                ))
                .toList();

        return reviews;
    }

    public BusInfoAndReviewResponse getReviewsByLicenseNo(String licenseNo, int userId) {
        Bus bus = busRepository.findByLicenseNo(licenseNo);
        if (bus == null) {
            throw new IllegalArgumentException("No bus found with license number: " + licenseNo);
        }

        BusDTOResponse busDTO = new BusDTOResponse(
                bus.getBusId(),
                bus.getCompanyName(),
                bus.getLicenseNo(),
                bus.getCategory(),
                bus.getStartTime(),
                backendUrl + "/" + bus.getPhoto(),
                bus.getRoute() != null ? bus.getRoute().getStops() : List.of(),
                busRepository.existsTicketByUserIdAndBusId(userId, bus.getBusId())
        );

        List<Review> reviewList = busRepository.findByBusId(bus.getBusId());

        List<ReviewDTOResponse> reviews = reviewList.stream()
                .map(review -> new ReviewDTOResponse(
                        review.getMessage(),
                        review.getUser().getId(),
                        review.getUser().getImageUrl(),
                        review.getReviewTime(),
                        review.getStars(),
                        review.getImages(),
                        review.getUser().getName()
                ))
                .toList();

        return new BusInfoAndReviewResponse(busDTO, reviews);
    }

    public List<BusDTOResponse> getTravelledBuses(int userId) {
        List<Bus> buses = busRepository.getTravelledBuses(userId);

        return buses.stream()
                .map(bus -> new BusDTOResponse(
                bus.getBusId(),
                bus.getCompanyName(),
                bus.getLicenseNo(),
                bus.getCategory(),
                bus.getStartTime(),
                backendUrl + "/" + bus.getPhoto(),
                bus.getRoute() != null ? bus.getRoute().getStops() : List.of(),
                busRepository.existsTicketByUserIdAndBusId(userId, bus.getBusId())
        )).toList();
    }

    @Transactional
    public void resetReviewSequence() {
        reviewRepository.resetSequence();
    }

    @Transactional
    public ReviewDTOResponse submitReview(ReviewRequest reviewRequest) throws Exception {
        // Validate inputs
        if (reviewRequest.getMessage() == null || reviewRequest.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Review message cannot be empty");
        }

        if (reviewRequest.getStars() < 1 || reviewRequest.getStars() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars");
        }

        // Check if user has traveled on this bus
        boolean hasTraveled = busRepository.existsTicketByUserIdAndBusId(
                (int) reviewRequest.getUserId(),
                reviewRequest.getBusId()
        );

        if (!hasTraveled) {
            throw new IllegalArgumentException("You must have traveled on this bus to leave a review");
        }

        // Create and save review
        Review review = new Review();
        review.setMessage(reviewRequest.getMessage());
        review.setStars(reviewRequest.getStars());
        if (reviewRequest.getImages() != null) {
            review.setImages(new ArrayList<>(reviewRequest.getImages()));
            // Create new mutable list
        }
        review.setImages(reviewRequest.getImages());
        System.out.println("review images set: "+ reviewRequest.getImages());
        review.setUser(userRepository.findById((long) reviewRequest.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
        review.setBus(busRepository.findById(reviewRequest.getBusId())
                .orElseThrow(() -> new IllegalArgumentException("Bus not found")));

        Review savedReview = reviewRepository.save(review);

        // Return response
        return new ReviewDTOResponse(
                savedReview.getMessage(),
                savedReview.getUser().getId(),
                savedReview.getUser().getImageUrl(),
                savedReview.getReviewTime(),
                savedReview.getStars(),
                savedReview.getImages(),
                savedReview.getUser().getName()
        );
    }
    
}
