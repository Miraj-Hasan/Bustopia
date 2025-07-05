package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;

import java.time.Duration;

@Entity
@Table(name = "Time_mapping")
public class TimeMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mappingId;

    @Column(nullable = false)
    private String stop1;

    @Column(nullable = false)
    private String stop2;

    @Column(nullable = false)
    private Integer duration;

}