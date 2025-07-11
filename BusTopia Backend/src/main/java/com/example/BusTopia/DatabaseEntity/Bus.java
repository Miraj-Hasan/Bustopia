package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;


@Entity
@Data
@Table(name = "Bus", uniqueConstraints = @UniqueConstraint(columnNames = "license_no"))
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer busId;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String licenseNo;

    @Column(nullable = false)
    private String category;

    private LocalTime startTime;

    private String photo;

    @ManyToOne
    @JoinColumn(name = "route_id", foreignKey = @ForeignKey(name = "route_id_FK"))
    private Route route;

    @ManyToOne
    @JoinColumn(name = "layout_id")
    private SeatLayout seatLayout;
}