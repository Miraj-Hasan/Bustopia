package com.example.BusTopia.DatabaseEntity;

import com.example.BusTopia.DatabaseEntity.Converters.BookedSeatMapConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@Table(name = "Seat_availability_mapping", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"bus_id", "journey_date"})
})
public class SeatAvailabilityMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private LocalDate journeyDate;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer availableSeats;

    // Map<seatLabel, ticketId>
    @Convert(converter = BookedSeatMapConverter.class)
    private Map<String, Long> bookedSeats = new HashMap<>();
}


