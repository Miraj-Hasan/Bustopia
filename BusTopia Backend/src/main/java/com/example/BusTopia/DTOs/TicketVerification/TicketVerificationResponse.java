package com.example.BusTopia.DTOs.TicketVerification;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class TicketVerificationResponse {
    private String busPhoto;
    private String busCompany;
    private LocalTime scheduledStartTime;
    private int price;
    private LocalDate date;
    private String userName;
    private String busType;
    private boolean verified;

    public static TicketVerificationResponse notVerified() {
        return new TicketVerificationResponse(
                null, null, null, 0, null, null, null, false
        );
    }
}
