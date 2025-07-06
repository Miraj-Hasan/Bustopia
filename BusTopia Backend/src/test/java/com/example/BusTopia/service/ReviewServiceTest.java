package com.example.BusTopia.service;

import com.example.BusTopia.AwsConfiguration.AwsFileUpload;
import com.example.BusTopia.DTOs.Review.BusDTOResponse;
import com.example.BusTopia.DTOs.Review.ReviewDTOResponse;
import com.example.BusTopia.DTOs.Review.ReviewRequest;
import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.ReviewRepository;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import com.example.BusTopia.Services.ReviewService;
import com.example.BusTopia.TestDataBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private BusRepository busRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private AwsFileUpload awsFileUpload;

    @InjectMocks
    private ReviewService reviewService;

    // Test data
    private final UserEntity testUser = TestDataBuilder.buildUser();
    private final Bus testBus = TestDataBuilder.buildBus();
    private final Review testReview = TestDataBuilder.buildReview();


    @Test
    void getAllCompanyNames_ShouldReturnCompanyList() {
        // Arrange
        when(busRepository.findDistinctCompanyNames())
                .thenReturn(List.of("Green Line Paribahan", "Ena Transport"));

        // Act
        List<String> companies = reviewService.getAllCompanyNames();

        // Assert
        assertEquals(2, companies.size());
        assertTrue(companies.contains("Green Line Paribahan"));
        verify(busRepository, times(1)).findDistinctCompanyNames();
    }

    @Test
    void getAllBusesOfACompanyDTO_ShouldReturnPaginatedResults() {
        // Arrange
        Page<Bus> mockPage = new PageImpl<>(List.of(testBus));
        when(busRepository.findSpecificCompanyBus(anyString(), any(Pageable.class)))
                .thenReturn(mockPage);
        when(busRepository.existsTicketByUserIdAndBusId(anyInt(), anyInt()))
                .thenReturn(true);

        // Act
        Page<BusDTOResponse> result = reviewService.getAllBusesOfACompanyDTO(
                "Green Line Paribahan", 0, 10, 1);

        // Assert
        assertEquals(1, result.getContent().size());
        assertEquals("ABC-DEF-50-5", result.getContent().get(0).getLicenseNo());
        assertTrue(result.getContent().get(0).isCanCurrentUserReview());
    }

    @Test
    void getReviewsByBusId_ShouldReturnReviewList() {
        // Arrange
        when(reviewRepository.findByBusId(1))
                .thenReturn(List.of(testReview));

        // Act
        List<ReviewDTOResponse> reviews = reviewService.getReviewsByBusId(1);

        // Assert
        assertEquals(1, reviews.size());
        assertEquals("Great service!", reviews.get(0).getMessage());
        assertEquals(5, reviews.get(0).getStars());
    }


    @Test
    void submitReview_ShouldSuccess_WhenValidRequest() throws Exception {
        // Arrange
        ReviewRequest request = new ReviewRequest(
                1, 1, 5, "Great trip!", List.of("image1.jpg"));

        when(busRepository.existsTicketByUserIdAndBusId(1, 1))
                .thenReturn(true);
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(busRepository.findById(1))
                .thenReturn(Optional.of(testBus));
        when(reviewRepository.save(any(Review.class)))
                .thenReturn(testReview);

        // Act
        ReviewDTOResponse response = reviewService.submitReview(request);

        // Assert
        assertNotNull(response);
        assertEquals("Great service!", response.getMessage());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void getReviewsByBusId_ShouldReturnEmptyList_WhenNoReviews() {
        // Arrange
        when(reviewRepository.findByBusId(1))
                .thenReturn(List.of());

        // Act
        List<ReviewDTOResponse> reviews = reviewService.getReviewsByBusId(1);

        // Assert
        assertTrue(reviews.isEmpty());
    }

    @Test
    void getReviewsByLicenseNo_ShouldThrow_WhenBusNotFound() {
        // Arrange
        when(busRepository.findByLicenseNo("INVALID"))
                .thenReturn(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            reviewService.getReviewsByLicenseNo("INVALID", 1);
        }, "No bus found with license number");
    }

}
