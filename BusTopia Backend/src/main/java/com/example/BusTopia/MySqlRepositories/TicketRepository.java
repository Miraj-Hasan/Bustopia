package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    @Query("SELECT t FROM Ticket t WHERE t.ticketCode = :ticketCode AND t.bus.companyName = :companyName")
    Ticket findTicketByCodeAndCompany(@Param("ticketCode") String ticketCode,
                                      @Param("companyName") String companyName);

    List<Ticket> findByUser(UserEntity user);

    @Query(value = """
        SELECT 
            pm.stop1 AS source,
            pm.stop2 AS destination,
            pm.price AS price,
            COALESCE(COUNT(t.ticket_id), 0) AS ticketsSold,
            COALESCE(SUM(t.price), 0) AS totalRevenue
        FROM price_mapping pm
        LEFT JOIN ticket t ON t.source = pm.stop1 AND t.destination = pm.stop2
        GROUP BY pm.stop1, pm.stop2, pm.price
    """, nativeQuery = true)
    List<Object[]> getTicketSalesByRouteWithPrice();
}
