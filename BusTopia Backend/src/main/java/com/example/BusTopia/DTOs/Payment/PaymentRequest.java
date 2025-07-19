package com.example.BusTopia.DTOs.Payment;

import com.example.BusTopia.DTOs.BuyTicket.BookTicketRequest;
import lombok.Data;

@Data
public class PaymentRequest {
    private double amount;
    private String tranId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BookTicketRequest bookingData;
}
