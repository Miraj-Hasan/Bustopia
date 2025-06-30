package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "Review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reviewId;

    @Column(nullable = false)
    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;


    @Column(name = "images") // Added length for long URLs
//    @Convert(converter = StringListConverter.class)
    private List<String> images = new ArrayList<>(); // Initialize collection

    private int stars;

    @CreationTimestamp
    @Column(name = "review_time", nullable = false, updatable = false)
    private LocalDateTime reviewTime;
}
