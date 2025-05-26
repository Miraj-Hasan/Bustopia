package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Review")
public class Review {
    @Id
    private Integer reviewId;

    @Column(nullable = false)
    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    private List<String> images;
}
