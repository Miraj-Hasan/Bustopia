package com.example.BusTopia.DTOs.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class BusDTOResponse {
    private Integer busId;
    private String companyName;
    private String licenseNo;
    private String category;
    private LocalDateTime startTime;
    private String photo;
    private List<String> stops;
}
