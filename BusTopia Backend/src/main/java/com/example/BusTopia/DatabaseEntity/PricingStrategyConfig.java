package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "Pricing_config")
@Data
public class PricingStrategyConfig {
    @Id
    private Long id = 1L; // singleton config

    private double minPrice;
    private double maxPrice;
    private double increasePercent;
    private double decreasePercent;
}
