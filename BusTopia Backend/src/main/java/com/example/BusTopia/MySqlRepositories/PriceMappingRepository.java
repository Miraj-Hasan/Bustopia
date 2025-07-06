package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.PriceMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceMappingRepository extends JpaRepository<PriceMapping,Integer> {
    List<PriceMapping> findByStop1IgnoreCaseAndStop2IgnoreCase(String stop1, String stop2);

    @Query(value = """
        SELECT price
        FROM price_mapping
        WHERE (
            (LOWER(stop1) = LOWER(:stop1) AND LOWER(stop2) = LOWER(:stop2))
            OR
            (LOWER(stop1) = LOWER(:stop2) AND LOWER(stop2) = LOWER(:stop1))
        )
        AND LOWER(category) = LOWER(:category)
        LIMIT 1
    """, nativeQuery = true)
        Optional<Integer> getPrice(@Param("stop1") String stop1,
                                   @Param("stop2") String stop2,
                                   @Param("category") String category);

    @Query(value = """
                    SELECT DISTINCT stop1 AS stop FROM price_mapping
                    UNION
                    SELECT DISTINCT stop2 AS stop FROM price_mapping
                    """, nativeQuery = true)
    List<String> findAllDistinctStops();

    @Query(value = """
        SELECT DISTINCT stop2
        FROM price_mapping
        WHERE stop1 = :source
        UNION
        SELECT DISTINCT stop1
        FROM price_mapping
        WHERE stop2 = :source
    """, nativeQuery = true)
        List<String> findDistinctDestinationsFromSource(@Param("source") String source);

    @Query("SELECT p FROM PriceMapping p WHERE " +
            "(LOWER(p.stop1) = LOWER(:stop1) AND LOWER(p.stop2) = LOWER(:stop2)) OR " +
            "(LOWER(p.stop1) = LOWER(:stop2) AND LOWER(p.stop2) = LOWER(:stop1))")
    List<PriceMapping> findByStopsBidirectional(@Param("stop1") String stop1, @Param("stop2") String stop2);    

}
