package com.example.BusTopia.controller;

import com.example.BusTopia.AwsConfiguration.AwsFileUpload;
import com.example.BusTopia.DTOs.Review.ReviewDTOResponse;
import com.example.BusTopia.DTOs.Review.ReviewRequest;
import com.example.BusTopia.Services.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean  // Changed from @Mock to @MockBean for Spring tests
    private ReviewService reviewService;

    @MockBean  // Changed from @Mock to @MockBean for Spring tests
    private AwsFileUpload awsFileUpload;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup(WebApplicationContext webApplicationContext) {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser
    void getAllCompanies_ShouldReturn200() throws Exception {
        // Arrange
        when(reviewService.getAllCompanyNames())
                .thenReturn(List.of("Green Line Paribahan", "Ena Transport"));

        // Act & Assert
        mockMvc.perform(get("/api/getAllCompanies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0]").value("Green Line Paribahan"));
    }

    @Test
    @WithMockUser
    void submitReview_ShouldReturn201_WhenValid() throws Exception {
        // Arrange
        ReviewRequest request = new ReviewRequest(1, 1, 5, "Great", null);
        ReviewDTOResponse response = new ReviewDTOResponse(
                "Great", 1L, "user.jpg", LocalDateTime.now(), 5, null, "User Name");

        when(reviewService.submitReview(any(ReviewRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Great"));
    }

    @Test
    @WithMockUser
    void submitReview_ShouldReturn400_WhenInvalid() throws Exception {
        // Arrange
        ReviewRequest request = new ReviewRequest(1, 1, 5,"",  null);

        when(reviewService.submitReview(any(ReviewRequest.class)))
                .thenThrow(new IllegalArgumentException("Review message cannot be empty"));

        // Act & Assert
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Review message cannot be empty")));
    }

}