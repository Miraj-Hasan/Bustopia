package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.SeatLayout;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SeatLayoutService {

    @Autowired
    private final BusRepository busRepository;

    public Optional<SeatLayout> getSeatLayoutByBusId(Integer busId) {
        return busRepository.findById(busId)
                .map(bus -> bus.getSeatLayout());
    }
}