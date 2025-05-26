package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Route")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer routeId;

    private List<String> stops;
}