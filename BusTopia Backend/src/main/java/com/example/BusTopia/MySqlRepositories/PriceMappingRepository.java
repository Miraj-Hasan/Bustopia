package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.PriceMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceMappingRepository extends JpaRepository<PriceMapping,Integer> {
    List<PriceMapping> findByStop1IgnoreCaseAndStop2IgnoreCase(String stop1, String stop2);
}
