package com.example.BusTopia.Services;

import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import org.springframework.stereotype.Service;

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

    public List<BusDTOResponse> getAllBusesOfACompanyDTO(String companyName) {
        List<Bus> buses = busRepository.findSpecificCompanyBus(companyName);

        return buses.stream()
                .map(bus -> new BusDTOResponse(
                        bus.getCompanyName(),
                        bus.getLicenseNo(),
                        bus.getCategory(),
                        bus.getStartTime(),
                        bus.getPhoto(),
                        bus.getRoute() != null ? bus.getRoute().getStops() : List.of()
                ))
                .toList();
    }
}
