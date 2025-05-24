package com.example.BusTopia.RedisConfiguration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/test")
public class RedisTester {
    @Autowired
    private StringRedisTemplate redisTemplate;

    @GetMapping("/redis-health")
    public ResponseEntity<String> checkRedisHealth() {
        System.out.println("Welcome to Redis Health Check");
        try {
            redisTemplate.opsForValue().set("ping", "pong");
            String value = redisTemplate.opsForValue().get("ping");
            return ResponseEntity.ok("Redis connection OK: " + value);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Redis connection failed: " + e.getMessage());
        }
    }
}


