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
}
