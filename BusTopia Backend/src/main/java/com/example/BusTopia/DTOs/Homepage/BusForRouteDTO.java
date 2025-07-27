package com.example.BusTopia.DTOs.Homepage;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
public class BusForRouteDTO {
    private Integer busId;
    private String companyName;
    private String category;
    private LocalTime startTime;
    private String licenseNo;
}
