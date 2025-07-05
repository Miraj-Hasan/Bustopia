package com.example.BusTopia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BusTopiaApplication {

	public static void main(String[] args) {
		SpringApplication.run(BusTopiaApplication.class, args);
	}

}
