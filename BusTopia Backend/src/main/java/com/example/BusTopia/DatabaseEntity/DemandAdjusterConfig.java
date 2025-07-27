package com.example.BusTopia.DatabaseEntity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "demand_adjuster_config")
@Data
public class DemandAdjusterConfig {
    @Id
    private Long id = 1L; // singleton config

    private int rerouteCount;           // e.g., 50
    private int underperformThreshold;  // e.g., ≤ 20 seats sold in last 30 days
    private int highDemandThreshold;    // e.g., ≥ 200 seats sold in last 30 days
}
