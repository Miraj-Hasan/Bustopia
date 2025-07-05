package com.example.BusTopia.DatabaseEntity;

import com.example.BusTopia.DatabaseEntity.Converters.StringListConverter;
import com.example.BusTopia.MySqlRepositories.TimeMappingRepository;
import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor          // ✅ Adds default constructor
@Table(name = "Ticket")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketId;

    @Column(unique = true)
    private String ticketCode;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private LocalDate date;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> seats;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private LocalTime scheduledTime;

//    @Column(nullable = false)
    @Column
    private LocalTime bookingTime;

//    @Column(nullable = false)
    @Column
    private String status;

    @PrePersist
    public void generateTicketCode() {
        String busPart = (bus != null && bus.getBusId() != null) ? String.valueOf(bus.getBusId()) : "XXX";
        String datePart = (date != null) ? date.format(DateTimeFormatter.BASIC_ISO_DATE): "YYYYMMDD";
        String randomPart = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10).toUpperCase();

        this.ticketCode = String.format("TKT-%s-%s-%s", busPart, datePart, randomPart);
    }
}

