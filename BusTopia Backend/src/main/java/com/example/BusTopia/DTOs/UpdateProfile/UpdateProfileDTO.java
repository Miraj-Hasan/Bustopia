package com.example.BusTopia.DTOs.UpdateProfile;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileDTO {
    private String username;
    private String phone;
    private String gender;
}
