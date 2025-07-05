package com.example.BusTopia.DTOs.BuyTicket;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Data
@AllArgsConstructor
public class BookTicketRequest {
    private Long userId;
    private Integer busId;
    private LocalDate date;
    private LocalTime time;
    private String source;
    private String destination;
}
