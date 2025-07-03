package com.example.BusTopia.DTOs.BuyTicket;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.Date;

@Data
@AllArgsConstructor
public class BookTicketRequest {
    private Long userId;
    private Integer busId;
    private LocalDate date;
    private String source;
    private String destination;
}
