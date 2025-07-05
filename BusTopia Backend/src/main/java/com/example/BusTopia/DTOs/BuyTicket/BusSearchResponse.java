package com.example.BusTopia.DTOs.BuyTicket;

import com.example.BusTopia.DatabaseEntity.Route;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class BusSearchResponse {
    private Integer busId;
    private String companyName;
    private String licenseNo;
    private String category;
    private String source;
    private String destination;
    private LocalTime departureTime;
    private int price;
    Route route;
}
