package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BusRepository extends JpaRepository<Bus, Integer> {

    @Query("SELECT DISTINCT b.companyName FROM Bus b")
    List<String> findDistinctCompanyNames();

    @Query("SELECT b FROM Bus b WHERE b.companyName = :companyName")
    Page<Bus> findSpecificCompanyBus(@Param("companyName") String companyName, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.bus.busId = :busId")
    List<Review> findByBusId(int busId);

    Bus findByLicenseNo(String licenseNo);

}
