package com.example.BusTopia.Schedulers;

import com.example.BusTopia.DTOs.RerouteInfo;
import com.example.BusTopia.DatabaseEntity.PricingStrategyConfig;
import com.example.BusTopia.DatabaseEntity.DemandAdjusterConfig;
import com.example.BusTopia.MySqlRepositories.PricingStrategyConfigRepository;
import com.example.BusTopia.MySqlRepositories.DemandAdjusterConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class SchedulerController {

    private final PriceUpdaterScheduler scheduler;
    private final PricingStrategyConfigRepository pricingConfigRepository;
    private final DemandAdjusterConfigRepository demandAdjusterConfigRepository;
    private final DemandBasedFrequencyScheduler frequencyScheduler;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/price-config")
    public ResponseEntity<PricingStrategyConfig> getCurrentPriceConfig() {
        PricingStrategyConfig config = pricingConfigRepository.findById(1L).orElse(null);
        if (config == null) {
            // Return default values if no config exists
            config = new PricingStrategyConfig();
            config.setMinPrice(200.0);
            config.setMaxPrice(5000.0);
            config.setIncreasePercent(15.0);
            config.setDecreasePercent(10.0);
        }
        return ResponseEntity.ok(config);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/price-config")
    public ResponseEntity<String> updatePriceConfig(@RequestBody PricingStrategyConfig config) {
        try {
            // Set the ID to 1 (singleton pattern)
            config.setId(1L);
            
            // Save or update the configuration
            pricingConfigRepository.save(config);
            
            return ResponseEntity.ok("✅ Price configuration updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Failed to update price configuration: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/demand-config")
    public ResponseEntity<DemandAdjusterConfig> getCurrentDemandConfig() {
        DemandAdjusterConfig config = demandAdjusterConfigRepository.findById(1L).orElse(null);
        if (config == null) {
            // Return default values if no config exists
            config = new DemandAdjusterConfig();
            config.setHighDemandThreshold(200);
            config.setUnderperformThreshold(20);
            config.setRerouteCount(50);
        }
        return ResponseEntity.ok(config);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/demand-config")
    public ResponseEntity<String> updateDemandConfig(@RequestBody DemandAdjusterConfig config) {
        try {
            // Set the ID to 1 (singleton pattern)
            config.setId(1L);
            
            // Save or update the configuration
            demandAdjusterConfigRepository.save(config);
            
            return ResponseEntity.ok("✅ Demand configuration updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Failed to update demand configuration: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/trigger-price-update")
    public ResponseEntity<String> triggerPriceUpdateManually() {
        scheduler.updatePrices();  // call directly
        return ResponseEntity.ok("✅ Price update triggered manually.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reroute")
    public ResponseEntity<?> triggerRerouteManually() {
        List<RerouteInfo> reroutedBuses = frequencyScheduler.adjustBusFrequencies();

        return ResponseEntity.ok(reroutedBuses);
    }
}
