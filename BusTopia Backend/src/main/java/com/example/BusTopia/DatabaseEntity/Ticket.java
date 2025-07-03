package com.example.BusTopia.DatabaseEntity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Ticket")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketId;

    private String ticketCode;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private LocalDateTime date;

    private List<String> seats;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private Integer price;

    @PrePersist
    private void generateCustomTicketId() {
        String busPart = (bus != null && bus.getBusId() != null) ? String.valueOf(bus.getBusId()) : "XXX";
        String datePart = (date != null) ? date.toLocalDate().toString().replaceAll("-", "") : "YYYYMMDD";
        String randomPart = java.util.UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10).toUpperCase();
        this.ticketCode = String.format("TKT-%s-%s-%s", busPart, datePart, randomPart);
    }
}

