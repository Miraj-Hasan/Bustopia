package com.example.BusTopia.DatabaseEntity;

import com.example.BusTopia.DatabaseEntity.Converters.SeatGridConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "Seat_layout")
public class SeatLayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer layoutId;

    @Column(nullable = false)
    private String name; // e.g., "AC Standard 2+2", "Non-AC 3+2"

    @Column(nullable = false)
    private String category; // AC / Non-AC

    @Convert(converter = SeatGridConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private List<List<String>> layout; // grid of seat labels
}
