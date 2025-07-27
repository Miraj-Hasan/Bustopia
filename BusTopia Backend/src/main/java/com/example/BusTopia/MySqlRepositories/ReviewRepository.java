package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    @Query(value = "SELECT setval('review_review_id_seq', COALESCE((SELECT MAX(review_id) FROM review), 0) + 1, false)", nativeQuery = true)
    Long resetSequence();

    @Query("SELECT r FROM Review r WHERE r.bus.busId = :busId")
    List<Review> findByBusId(int busId);

    List<Review> findByBusBusIdIn(List<Integer> busIds);

}
