package com.example.BusTopia.DatabaseEntity;

import com.example.BusTopia.MySqlRepositories.TimeMappingRepository;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Table(name = "Ticket")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketId;

    @Column(unique = true)
    private String ticketCode;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private LocalDate date;

    private List<String> seats;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private LocalTime scheduledTime;

    @Transient
    @Autowired
    private transient TimeMappingRepository timeMappingRepository;

    @PrePersist
    private void generateTicketCodeAndCalculateStartTime() {
        String busPart = (bus != null && bus.getBusId() != null) ? String.valueOf(bus.getBusId()) : "XXX";
        String datePart = (date != null) ? date.format(DateTimeFormatter.BASIC_ISO_DATE): "YYYYMMDD";
        String randomPart = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10).toUpperCase();

        this.ticketCode = String.format("TKT-%s-%s-%s", busPart, datePart, randomPart);


        // Get the bus's base start time
        LocalTime baseStartTime = bus.getStartTime();
        if (baseStartTime == null) {
            throw new IllegalStateException("Bus start time is not set");
        }

        // Get the route stops
        List<String> routeStops = bus.getRoute().getStops();
        if (routeStops == null || routeStops.isEmpty()) {
            throw new IllegalStateException("Route stops are not defined");
        }

        // Find the position of the source in the route
        int sourceIndex = routeStops.indexOf(source);
        if (sourceIndex == -1) {
            throw new IllegalArgumentException("Source location not found in route");
        }

        // If source is the first stop, use the bus's start time directly
        if (sourceIndex == 0) {
            this.scheduledTime = baseStartTime;
            return;
        }

        // Calculate cumulative time from first stop to source
        Duration totalDuration = Duration.ZERO;

        for (int i = 0; i < sourceIndex; i++) {
            String currentStop = routeStops.get(i);
            String nextStop = routeStops.get(i + 1);

            // Find the time mapping between these stops
            Duration segmentDuration = timeMappingRepository.findDurationBetweenStops(currentStop, nextStop)
                    .orElseThrow(() -> new IllegalStateException(
                            String.format("No time mapping found between %s and %s", currentStop, nextStop)
                    ));

            totalDuration = totalDuration.plus(segmentDuration);
        }

        // Calculate scheduled time by adding duration to base start time
        this.scheduledTime = baseStartTime.plus(totalDuration);
    }

}

