package com.example.BusTopia.service;

import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DTOs.TicketVerification.TicketVerificationResponse;
import com.example.BusTopia.MySqlRepositories.TicketRepository;
import com.example.BusTopia.Services.TicketVerificationService;
import com.example.BusTopia.TestDataBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketVerificationServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketVerificationService ticketVerificationService;

    @Test
    void verifyTicket_ShouldReturnVerifiedResponse_WhenTicketExists() {
        // Arrange
        String ticketCode = "TKT-1-20230706-ABC123XYZ";
        String companyName = "Green Line Paribahan";
        String backendUrl = "http://localhost:8080";

        Ticket mockTicket = TestDataBuilder.buildTicket();

        when(ticketRepository.findTicketByCodeAndCompany(ticketCode, companyName))
                .thenReturn(mockTicket);

        ticketVerificationService.backendUrl = backendUrl;

        // Act
        TicketVerificationResponse response = ticketVerificationService.verifyTicket(ticketCode, companyName);

        // Assert
        assertTrue(response.isVerified());
        assertEquals(backendUrl + "/" + mockTicket.getBus().getPhoto(), response.getBusPhoto());
        assertEquals(mockTicket.getBus().getCompanyName(), response.getBusCompany());
        assertEquals(mockTicket.getScheduledTime(), response.getScheduledStartTime());
        assertEquals(mockTicket.getPrice(), response.getPrice());
        assertEquals(mockTicket.getDate(), response.getDate());
        assertEquals(mockTicket.getUser().getName(), response.getUserName());
        assertEquals(mockTicket.getBus().getCategory(), response.getBusType());

        verify(ticketRepository, times(1)).findTicketByCodeAndCompany(ticketCode, companyName);
    }

    @Test
    void verifyTicket_ShouldReturnNotVerifiedResponse_WhenTicketDoesNotExist() {
        // Arrange
        String ticketCode = "INVALID123";
        String companyName = "Green Line";

        when(ticketRepository.findTicketByCodeAndCompany(ticketCode, companyName))
                .thenReturn(null);

        // Act
        TicketVerificationResponse response = ticketVerificationService.verifyTicket(ticketCode, companyName);

        // Assert
        assertFalse(response.isVerified());
        assertNull(response.getBusPhoto());
        assertNull(response.getBusCompany());
        assertNull(response.getScheduledStartTime());
        assertEquals(0, response.getPrice());
        assertNull(response.getDate());
        assertNull(response.getUserName());
        assertNull(response.getBusType());

        verify(ticketRepository, times(1)).findTicketByCodeAndCompany(ticketCode, companyName);
    }
}