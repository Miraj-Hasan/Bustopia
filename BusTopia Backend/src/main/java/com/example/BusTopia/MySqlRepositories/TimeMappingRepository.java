package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.TimeMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

@Repository
public interface TimeMappingRepository extends JpaRepository<TimeMapping, Integer> {
    @Query(value = "SELECT duration FROM time_mapping " +
            "WHERE (stop1 = :stop1 AND stop2 = :stop2) OR (stop1 = :stop2 AND stop2 = :stop1) " +
            "ORDER BY (stop1 = :stop1 AND stop2 = :stop2) DESC " +
            "LIMIT 1", nativeQuery = true)
    Optional<Duration> findDurationBetweenStops(
            @Param("stop1") String stop1,
            @Param("stop2") String stop2
    );
}
