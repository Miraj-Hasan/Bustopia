package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.DatabaseEntity.Route;
import com.example.BusTopia.DatabaseEntity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {

    @Query("SELECT DISTINCT b.companyName FROM Bus b")
    List<String> findDistinctCompanyNames();

    @Query("SELECT b FROM Bus b WHERE b.companyName = :companyName")
    Page<Bus> findSpecificCompanyBus(@Param("companyName") String companyName, Pageable pageable);

    Bus findByLicenseNo(String licenseNo);

    @Query("SELECT COUNT(t) > 0 FROM Ticket t WHERE t.user.id = :userId AND t.bus.busId = :busId")
    boolean existsTicketByUserIdAndBusId(@Param("userId") int userId, @Param("busId") int busId);

    @Query("SELECT t.bus FROM Ticket t WHERE t.user.id = :userId")
    List<Bus> getTravelledBuses(@Param("userId") int userId);

    List<Bus> findByRouteIn(List<Route> routes);

//    @Query("SELECT b FROM Bus b WHERE b.source = :source AND b.destination = :destination AND DATE(b.departureTime) = :date")
//    List<Bus> findAvailableBuses(@Param("source") String source,
//                                 @Param("destination") String destination,
//                                 @Param("date") LocalDate date);
    @Query(value = "SELECT * FROM bus LIMIT 10", nativeQuery = true)
    List<Bus> findAvailableBuses();

    List<Bus> findByCompanyNameIgnoreCase(String companyName);

}
