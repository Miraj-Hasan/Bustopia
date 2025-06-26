package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Route")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer routeId;

    @ElementCollection
    @CollectionTable(name = "route_stops", joinColumns = @JoinColumn(name = "route_id"))
    @Column(name = "stop")
    private List<String> stops;
}