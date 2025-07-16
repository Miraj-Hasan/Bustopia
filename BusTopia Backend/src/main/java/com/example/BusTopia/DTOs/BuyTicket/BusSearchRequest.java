package com.example.BusTopia.DTOs.BuyTicket;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BusSearchRequest {
    private String source;
    private String destination;
    private LocalDate date;
    private String category;
    private int min_budget;
    private int max_budget;
}

