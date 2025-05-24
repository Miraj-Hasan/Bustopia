package com.example.BusTopia.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class TempPasswordResetService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private final Duration TOKEN_TTL = Duration.ofMinutes(5);
    private static final String PREFIX = "reset:";

    private static final Duration RATE_LIMIT_TTL = Duration.ofMinutes(2);

    public boolean isRateLimited(String email) {
        String key = "reset-req:" + email;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }

    public void applyRateLimit(String email) {
        String key = "reset-req:" + email;
        redisTemplate.opsForValue().set(key, "1", RATE_LIMIT_TTL);
    }


    public String createResetToken(String email) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(PREFIX + token, email, TOKEN_TTL);
        return token;
    }

    public String getEmailByToken(String token) {
        return redisTemplate.opsForValue().get(PREFIX + token);
    }

    public void deleteToken(String token) {
        redisTemplate.delete(PREFIX + token);
    }
}
