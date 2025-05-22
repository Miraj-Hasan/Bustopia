package com.example.BusTopia.DTOs.Authentication;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    String token;
    String role;
    String name;
}
