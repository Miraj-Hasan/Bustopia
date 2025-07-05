package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.SeatAvailabilityMapping;
import com.example.BusTopia.MySqlRepositories.SeatAvailabilityMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Service
public class SeatAvailabilityService {

    @Autowired
    private SeatAvailabilityMappingRepository seatAvailabilityMappingRepository;

    public Optional<Map<String, Long>> getBookedSeatsByBusIdAndDate(Integer busId, LocalDate journeyDate) {
        return seatAvailabilityMappingRepository.findByBus_BusIdAndJourneyDate(busId, journeyDate)
                .map(SeatAvailabilityMapping::getBookedSeats);
    }
}