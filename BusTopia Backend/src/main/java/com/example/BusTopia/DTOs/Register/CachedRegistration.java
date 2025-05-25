package com.example.BusTopia.DTOs.Register;

import lombok.*;

import java.io.Serializable;
import java.util.Base64;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CachedRegistration implements Serializable {
    private RegisterRequest registerRequest;

    private String imageBase64;

    public CachedRegistration(RegisterRequest registerRequest, byte[] imageBytes) {
        this.registerRequest = registerRequest;
        this.imageBase64 = (imageBytes != null) ? Base64.getEncoder().encodeToString(imageBytes) : null;
    }

    public byte[] getImageBytes() {
        return (imageBase64 != null) ? Base64.getDecoder().decode(imageBase64) : null;
    }
}
