package com.example.BusTopia.Services;

import com.example.BusTopia.MySqlRepositories.SeatAvailabilityMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatAvailabilityCleanupService {

    private final SeatAvailabilityMappingRepository repository;

    @Scheduled(cron = "0 0 3 * * ?") // every day at 3 AM
    public void deleteOldSeatAvailabilityRecords() {
        LocalDate today = LocalDate.now();
        repository.deleteByJourneyDateBefore(today);
        log.info("Old seat availability records deleted for dates before {}", today);
    }
}
