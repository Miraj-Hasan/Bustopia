package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route , Integer> {

    @Query(value = "SELECT * FROM route WHERE stops @> ARRAY[:stop1, :stop2]::varchar[] " +
            "AND array_position(stops, :stop1) < array_position(stops, :stop2)", nativeQuery = true)
    List<Route> findRoutesContainingBothStops(@Param("stop1") String stop1, @Param("stop2") String stop2);

}
