package com.example.BusTopia.Services;

import com.example.BusTopia.MySqlRepositories.BusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    private final BusRepository busRepository;

    public ReviewService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<String> getAllCompanyNames() {
        return busRepository.findDistinctCompanyNames();
    }

}
