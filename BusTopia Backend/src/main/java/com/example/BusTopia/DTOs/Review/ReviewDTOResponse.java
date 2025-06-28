package com.example.BusTopia.DTOs.Review;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class ReviewDTOResponse {
    private String message;
    private long userId;
    private String userPhoto;
    private LocalDateTime reviewTime;
    private int stars;
    private List<String> reviewImages;
    private String userName;
}
