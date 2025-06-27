package com.example.BusTopia.Services;

import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DTOs.Review.BusInfoAndReviewResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.JSONOutput;

import java.util.List;

@Service
public class ReviewService {
    private final BusRepository busRepository;

    public ReviewService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<String> getAllCompanyNames() {
        return busRepository.findDistinctCompanyNames();
    }

    public Page<BusDTOResponse> getAllBusesOfACompanyDTO(String companyName, int page, int size) {
        Page<Bus> busPage = busRepository.findSpecificCompanyBus(companyName, PageRequest.of(page, size));

        return busPage.map(bus -> new BusDTOResponse(
                        bus.getBusId(),
                        bus.getCompanyName(),
                        bus.getLicenseNo(),
                        bus.getCategory(),
                        bus.getStartTime(),
                        bus.getPhoto(),
                        bus.getRoute() != null ? bus.getRoute().getStops() : List.of()
                ));
    }

    public List<Review> getReviewsByBusId(int busId) {
        return busRepository.findByBusId(busId);
    }

    public BusInfoAndReviewResponse getReviewsByLicenseNo(String licenseNo) {
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
                bus.getRoute() != null ? bus.getRoute().getStops() : List.of()
        );

        List<Review> reviews = busRepository.findByBusId(bus.getBusId());

        return new BusInfoAndReviewResponse(busDTO, reviews);
    }
}
