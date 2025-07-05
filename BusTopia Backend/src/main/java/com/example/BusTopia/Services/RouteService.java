package com.example.BusTopia.Services;

import com.example.BusTopia.DatabaseEntity.Route;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
import com.example.BusTopia.MySqlRepositories.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RouteService {
    private final PriceMappingRepository priceMappingRepository;
    private final RouteRepository routeRepository;

    public List<String> getAllStops() {
        return priceMappingRepository.findAllDistinctStops();
    }

    public List<String> getDestinationsForSource(String source) {
        return priceMappingRepository.findDistinctDestinationsFromSource(source);
    }

    public List<Route> getRoutesContainingSourceAndDestination(String source, String destination) {
        return routeRepository.findRoutesContainingBothStops(source, destination);
    }
}
