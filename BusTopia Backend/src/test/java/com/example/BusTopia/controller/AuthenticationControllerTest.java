package com.example.BusTopia.controller;

import com.example.BusTopia.DTOs.Authentication.LoginRequest;
import com.example.BusTopia.DTOs.Register.CachedRegistration;
import com.example.BusTopia.DTOs.Register.RegisterRequest;
import com.example.BusTopia.DTOs.ResetPassword.ResetPasswordRequest;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.EmailService.EmailService;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import com.example.BusTopia.SecurityConfiguration.JwtUtility;
import com.example.BusTopia.Services.TempPasswordResetService;
import com.example.BusTopia.Services.TempRegistrationService;
import com.example.BusTopia.Services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtility jwtUtility;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private TempRegistrationService tempRegistrationService;

    @MockBean
    private TempPasswordResetService tempPasswordResetService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void login_ShouldSucceed_WithValidCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password");
        UserEntity user = new UserEntity();
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setRole("ROLE_USER");

        when(authenticationManager.authenticate(any())).thenReturn(Mockito.mock(Authentication.class));
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);
        when(jwtUtility.generateToken(user)).thenReturn("mock-jwt-token");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    void login_ShouldFail_WithInvalidCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest("wrong@example.com", "badpass");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Bad credentials"));
    }

    @Test
    void verifyRegistration_ShouldSucceed_WithValidCodeAndEmail() throws Exception {
        RegisterRequest request = new RegisterRequest("name", "test@example.com", "password", "123", "MALE");
        CachedRegistration cached = new CachedRegistration(request, (byte[]) null);

        when(tempRegistrationService.getRegistration("123456")).thenReturn(cached);
        Mockito.doNothing().when(tempRegistrationService).delete("123456");
        when(userService.register(eq(request), isNull())).thenReturn(new UserEntity());

        mockMvc.perform(get("/api/verify-registration")
                        .param("code", "123456")
                        .param("email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("Registration successful!"));
    }

    @Test
    void verifyRegistration_ShouldFail_WhenCodeInvalid() throws Exception {
        when(tempRegistrationService.getRegistration("badcode")).thenReturn(null);

        mockMvc.perform(get("/api/verify-registration")
                        .param("code", "badcode")
                        .param("email", "test@example.com"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid or expired link."));
    }

    @Test
    void resetPassword_ShouldSucceed_WhenTokenValid() throws Exception {
        String token = "resettoken123";
        String email = "test@example.com";
        UserEntity user = new UserEntity();
        user.setEmail(email);

        when(tempPasswordResetService.getEmailByToken(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(passwordEncoder.encode("newpassword")).thenReturn("encodedPwd");

        mockMvc.perform(post("/api/reset-password/" + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("password", "newpassword"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Password has been successfully reset."));
    }

    @Test
    void resetPassword_ShouldFail_WhenTokenInvalid() throws Exception {
        when(tempPasswordResetService.getEmailByToken("invalidtoken")).thenReturn(null);

        mockMvc.perform(post("/api/reset-password/invalidtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("password", "whatever"))))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid or expired reset link."));
    }

    @Test
    void pingMe_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/ping"))
                .andExpect(status().isOk());
    }
}
