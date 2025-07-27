package com.example.BusTopia.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RerouteInfo {
    private int busId;
    private String companyName;
    private int oldRouteId;
    private int newRouteId;
}
