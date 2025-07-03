package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Price_mapping")
public class PriceMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mappingId;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String stop1;

    @Column(nullable = false)
    private String stop2;

    @Column(nullable = false)
    private double price;
}
