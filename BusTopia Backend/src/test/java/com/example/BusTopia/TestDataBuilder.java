package com.example.BusTopia;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.Review;
import com.example.BusTopia.DatabaseEntity.Ticket;
import com.example.BusTopia.DatabaseEntity.UserEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class TestDataBuilder {
    public static UserEntity buildUser() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setPassword("password");
        user.setName("User Name");
        user.setImageUrl("image.jpg");
        return user;
    }

    public static Bus buildBus() {
        Bus bus = new Bus();
        bus.setBusId(1);
        bus.setCompanyName("Green Line Paribahan");
        bus.setLicenseNo("ABC-DEF-50-5");
        bus.setCategory("AC");
        bus.setStartTime(LocalTime.now());
        bus.setPhoto("bus.jpg");
        bus.setRoute(null);
        return bus;
    }

    public static Review buildReview() {
        Review review = new Review();
        review.setReviewId(1);
        review.setMessage("Great service!");
        review.setUser(buildUser());
        review.setBus(buildBus());
        review.setImages(List.of());
        review.setStars(5);
        review.setReviewTime(LocalDateTime.now());
        return review;
    }

    public static Ticket buildTicket() {
        Ticket ticket = new Ticket();
        ticket.setTicketId(1);
        ticket.setTicketCode("TKT-1-20230706-ABC123XYZ");
        ticket.setUser(buildUser());
        ticket.setBus(buildBus());
        ticket.setDate(LocalDate.now());
        ticket.setSeats(List.of("A1", "A2"));
        ticket.setSource("Dhaka");
        ticket.setDestination("Chittagong");
        ticket.setPrice(500);
        ticket.setScheduledTime(LocalTime.of(10, 30));
        ticket.setBookingTime(LocalTime.now());
        ticket.setStatus("CONFIRMED");
        return ticket;
    }

}
