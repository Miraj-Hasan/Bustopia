package com.example.BusTopia.Schedulers;

import com.example.BusTopia.DatabaseEntity.PriceMapping;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.PricingStrategyConfig;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
import com.example.BusTopia.MySqlRepositories.TicketRepository;
import com.example.BusTopia.MySqlRepositories.PricingStrategyConfigRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceUpdaterScheduler {

    private final TicketRepository ticketRepo;
    private final PriceMappingRepository priceRepo;
    private final PricingStrategyConfigRepository configRepo;

    private static final int LOOKBACK_DAYS = 30;

    // Runs at 2AM on the 1st day of every month
    @Scheduled(cron = "0 0 2 1 * *")
    @Transactional
    public void updatePrices() {
        PricingStrategyConfig config = configRepo.findById(1L)
                .orElseThrow(() -> new RuntimeException("Pricing config not found"));

        List<PriceMapping> allMappings = priceRepo.findAll();

        for (PriceMapping mapping : allMappings) {
            String source = mapping.getStop1();
            String destination = mapping.getStop2();
            String category = mapping.getCategory();
            double currentPrice = mapping.getPrice();

            List<Ticket> matchingTickets = ticketRepo.findBySourceAndDestinationAndCategorySinceDate(
                    source, destination, category, LocalDate.now().minusDays(LOOKBACK_DAYS)
            );

            int seatsSold = matchingTickets.stream()
                    .mapToInt(t -> t.getSeats() != null ? t.getSeats().size() : 0)
                    .sum();

            double updatedPrice = calculateNewPrice(currentPrice, seatsSold, config);

            if (Math.abs(updatedPrice - currentPrice) < 1) {
                System.out.printf("ℹ️ No significant change for %s → %s [%s]. Skipping.%n",
                        source, destination, category);
                continue;
            }

            mapping.setPrice(updatedPrice);

            System.out.printf("✅ Updated price for %s → %s [%s]: ৳%.0f → ৳%.0f (seats sold: %d)%n",
                    source, destination, category, currentPrice, updatedPrice, seatsSold);
        }

        priceRepo.saveAll(allMappings);
        System.out.println("✅ All price mappings updated successfully.");
    }

    private double calculateNewPrice(double currentPrice, int seatsSold, PricingStrategyConfig config) {
        double updatedPrice = currentPrice;

        if (seatsSold >= 100) {
            updatedPrice = currentPrice * (1 + config.getIncreasePercent() / 100);
        } else if (seatsSold <= 20) {
            updatedPrice = currentPrice * (1 - config.getDecreasePercent() / 100);
        } else {
            return currentPrice;
        }

        // Clamp price within min and max
        updatedPrice = Math.max(config.getMinPrice(), Math.min(updatedPrice, config.getMaxPrice()));
        return Math.round(updatedPrice);
    }
}
