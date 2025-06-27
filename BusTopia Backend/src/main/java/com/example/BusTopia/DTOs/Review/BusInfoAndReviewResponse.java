package com.example.BusTopia.DTOs.Review;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BusInfoAndReviewResponse {
    private BusDTOResponse bus;
    private List<Review> reviews;
}
