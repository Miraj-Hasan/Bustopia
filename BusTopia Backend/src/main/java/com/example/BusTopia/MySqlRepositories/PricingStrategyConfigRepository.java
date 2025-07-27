package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.PricingStrategyConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PricingStrategyConfigRepository extends JpaRepository<PricingStrategyConfig, Long> {
}
