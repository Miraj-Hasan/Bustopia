package com.example.BusTopia.DTOs.Admin;

public class TicketSalesResponse {
    private String source;
    private String destination;
    private Double price;
    private Long ticketsSold;
    private Double totalRevenue;

    public TicketSalesResponse(String source, String destination, Double price, Long ticketsSold, Double totalRevenue) {
        this.source = source;
        this.destination = destination;
        this.price = price;
        this.ticketsSold = ticketsSold;
        this.totalRevenue = totalRevenue;
    }

    // Getters and Setters
    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getTicketsSold() {
        return ticketsSold;
    }

    public void setTicketsSold(Long ticketsSold) {
        this.ticketsSold = ticketsSold;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
} 