package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BusService {
    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<Bus> getAvailableBuses(String source, String destination, LocalDate date) {
//        return busRepository.findAvailableBuses(source, destination, date);
        return busRepository.findAvailableBuses();
    }
}

