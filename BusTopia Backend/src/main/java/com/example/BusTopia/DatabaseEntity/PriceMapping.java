package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;

@Entity
@Table(name = "Price_mapping")
public class PriceMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mappingId;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private String stop1;

    @Column(nullable = false)
    private String stop2;

    @Column(nullable = false)
    private double price;
}
