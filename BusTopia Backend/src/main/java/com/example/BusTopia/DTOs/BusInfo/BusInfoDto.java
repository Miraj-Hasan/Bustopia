package com.example.BusTopia.DTOs.BusInfo;

import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class BusInfoDto {

    private Integer busId;
    private String companyName;
    private String licenseNo;
    private String category;
    private LocalTime startTime;
    private String photo;

    private RouteDto route;
    private SeatLayoutDto seatLayout;
    private List<PriceMappingDto> priceMappings;
    private List<TimeMappingDto> timeMappings;

    @Data
    public static class RouteDto {
        private Integer routeId;
        private List<String> stops;
    }

    @Data
    public static class SeatLayoutDto {
        private Integer layoutId;
        private String name;
        private String category;
        private List<List<String>> layout;
    }

    @Data
    public static class PriceMappingDto {
        private String stop1;
        private String stop2;
        private String category;
        private double price;
    }

    @Data
    public static class TimeMappingDto {
        private String stop1;
        private String stop2;
        private Integer duration;
    }
}
