package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.SeatAvailabilityMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface SeatAvailabilityMappingRepository extends JpaRepository<SeatAvailabilityMapping, Long> {

    void deleteByJourneyDateBefore(LocalDate cutoffDate);
}
