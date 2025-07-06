package com.example.BusTopia.controller;

import com.example.BusTopia.Controller.TicketController;
import com.example.BusTopia.DTOs.BuyTicket.BookTicketRequest;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.Services.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketService ticketService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void book_ShouldReturnTicket_WhenBookingIsSuccessful() throws Exception {
        // Arrange
        BookTicketRequest req = new BookTicketRequest();
        req.setUserId(10L);
        req.setBusId(1);
        req.setDate(LocalDate.of(2025, 7, 7));
        req.setTime(LocalTime.of(9, 0));
        req.setSource("Dhaka");
        req.setDestination("Chittagong");
        req.setSeats(List.of("A1", "A2"));

        Ticket mockTicket = new Ticket();
        mockTicket.setTicketId(123);
        mockTicket.setSource("Dhaka");
        mockTicket.setDestination("Chittagong");
        mockTicket.setPrice(1000);
        mockTicket.setSeats(List.of("A1", "A2"));

        when(ticketService.bookTicket(
                req.getUserId(),
                req.getBusId(),
                req.getDate(),
                req.getTime(),
                req.getSource(),
                req.getDestination(),
                req.getSeats()
        )).thenReturn(mockTicket);

        // Act & Assert
        mockMvc.perform(post("/tickets/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketId").value(123))
                .andExpect(jsonPath("$.source").value("Dhaka"))
                .andExpect(jsonPath("$.destination").value("Chittagong"))
                .andExpect(jsonPath("$.seats[0]").value("A1"))
                .andExpect(jsonPath("$.seats[1]").value("A2"));
    }
}
