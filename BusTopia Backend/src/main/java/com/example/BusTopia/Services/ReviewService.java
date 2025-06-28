package com.example.BusTopia.Services;

import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DTOs.Review.BusInfoAndReviewResponse;
import com.example.BusTopia.DTOs.Review.ReviewDTOResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    private final BusRepository busRepository;

    public ReviewService(BusRepository busRepository, UserRepository userRepository) {
        this.busRepository = busRepository;
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
                        bus.getPhoto(),
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
                bus.getPhoto(),
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
                bus.getPhoto(),
                bus.getRoute() != null ? bus.getRoute().getStops() : List.of(),
                busRepository.existsTicketByUserIdAndBusId(userId, bus.getBusId())
        )).toList();
    }
    
}
