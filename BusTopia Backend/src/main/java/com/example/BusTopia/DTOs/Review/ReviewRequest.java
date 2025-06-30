package com.example.BusTopia.DTOs.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
public class ReviewRequest {
    private int busId;
    private long userId;
    private int stars;
    private String message;
    private List<String> images;
}
