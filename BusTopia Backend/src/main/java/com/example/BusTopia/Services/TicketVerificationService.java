package com.example.BusTopia.Services;

import com.example.BusTopia.DTOs.TicketVerification.TicketVerificationResponse;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.MySqlRepositories.TicketRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TicketVerificationService {

    @Value("${backend.origin}")
    public String backendUrl;
    private final TicketRepository ticketRepository;

    public TicketVerificationService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public TicketVerificationResponse verifyTicket(String ticketCode, String companyName) {
        Ticket ticket = ticketRepository.findTicketByCodeAndCompany(ticketCode,companyName);

        if(ticket == null) {
            return TicketVerificationResponse.notVerified();
        }

        return new TicketVerificationResponse(
                backendUrl + "/" + ticket.getBus().getPhoto(),
                ticket.getBus().getCompanyName(),
                ticket.getScheduledTime(),
                ticket.getPrice(),
                ticket.getDate(),
                ticket.getUser().getName(),
                ticket.getBus().getCategory(),
                true
        );
    }
}
