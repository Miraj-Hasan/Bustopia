package com.example.BusTopia.controller;

import com.example.BusTopia.DTOs.TicketVerification.TicketVerificationResponse;
import com.example.BusTopia.Services.TicketVerificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TicketVerificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketVerificationService ticketVerificationService;

    @Test
    @WithMockUser
    void verifyTicket_ShouldReturnVerifiedResponse() throws Exception {
        String ticketCode = "TKT-1-20230706-ABC123XYZ";
        String companyName = "Green Line Paribahan";

        TicketVerificationResponse mockResponse = new TicketVerificationResponse(
                "http://localhost:8080/bus.jpg",
                companyName,
                LocalTime.of(10, 30),
                500,
                LocalDate.now(),
                "User Name",
                "AC",
                true
        );

        when(ticketVerificationService.verifyTicket(ticketCode, companyName))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/verifyTicket")
                        .param("ticketCode", ticketCode)
                        .param("companyName", companyName))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.busCompany").value(companyName))
                .andExpect(jsonPath("$.userName").value("User Name"));
    }

    @Test
    @WithMockUser
    void verifyTicket_ShouldReturnNotVerifiedResponse() throws Exception {
        String ticketCode = "INVALID123";
        String companyName = "Green Line Paribahan";

        when(ticketVerificationService.verifyTicket(ticketCode, companyName))
                .thenReturn(TicketVerificationResponse.notVerified());

        mockMvc.perform(get("/api/verifyTicket")
                        .param("ticketCode", ticketCode)
                        .param("companyName", companyName))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(false))
                .andExpect(jsonPath("$.busCompany").doesNotExist());
    }
}
