package com.example.BusTopia.DTOs.BuyTicket;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class BookTicketRequest {
    private Long userId;
    private Integer busId;
    private String source;
    private String destination;
    private LocalDate date;
    private LocalTime time;
    private List<String> seats;
}