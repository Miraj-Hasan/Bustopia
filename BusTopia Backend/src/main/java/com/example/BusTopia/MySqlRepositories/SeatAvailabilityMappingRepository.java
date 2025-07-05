package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.SeatAvailabilityMapping;
import com.example.BusTopia.DatabaseEntity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SeatAvailabilityMappingRepository extends JpaRepository<SeatAvailabilityMapping, Long> {

    void deleteByJourneyDateBefore(LocalDate cutoffDate);

    Optional<SeatAvailabilityMapping> findByBusAndJourneyDate(Bus bus, LocalDate journeyDate);

    Optional<SeatAvailabilityMapping> findByBus_BusIdAndJourneyDate(Integer busId, LocalDate journeyDate);
}
