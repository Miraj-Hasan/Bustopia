package com.example.BusTopia.Services;

import com.example.BusTopia.DTOs.Register.CachedRegistration;
import com.example.BusTopia.DTOs.Register.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class TempRegistrationService {

    private static final String PREFIX = "register:";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public String cacheRegistration(RegisterRequest request, byte[] imageBytes) throws Exception {
        CachedRegistration cached = new CachedRegistration(request, imageBytes);
        String json = objectMapper.writeValueAsString(cached);

        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        redisTemplate.opsForValue().set(PREFIX + code, json, Duration.ofMinutes(5));
        return code;
    }

    public CachedRegistration getRegistration(String code) throws Exception {
        String json = redisTemplate.opsForValue().get(PREFIX + code);
        if (json == null) return null;
        return objectMapper.readValue(json, CachedRegistration.class);
    }

    public void delete(String code) {
        redisTemplate.delete(PREFIX + code);
    }
}
