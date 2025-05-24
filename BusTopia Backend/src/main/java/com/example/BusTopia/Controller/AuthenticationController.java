package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.Authentication.LoginRequest;
import com.example.BusTopia.DTOs.ForgotPassword.ForgotPasswordRequest;
import com.example.BusTopia.DTOs.Register.CachedRegistration;
import com.example.BusTopia.DTOs.Register.RegisterRequest;
import com.example.BusTopia.DTOs.ResetPassword.ResetPasswordRequest;
import com.example.BusTopia.DatabaseEntity.PasswordResetEntity;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.EmailService.EmailService;
import com.example.BusTopia.MySqlRepositories.PassResetRepository;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import com.example.BusTopia.SecurityConfiguration.JwtUtility;
import com.example.BusTopia.Services.TempPasswordResetService;
import com.example.BusTopia.Services.TempRegistrationService;
import com.example.BusTopia.Services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api")
public class AuthenticationController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtility jwtUtility;

    @Autowired
    private UserService userService;

    @Autowired
    private TempRegistrationService tempRegistrationService;

    @Autowired
    private TempPasswordResetService tempPasswordResetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PassResetRepository passResetRepository;

    @Autowired
    private EmailService emailService;

    @Value("${frontend.origin}")
    private String FRONT_END;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest ){

        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),loginRequest.getPassword())
            );
            UserEntity userDetails = userRepository.findByEmail(loginRequest.getEmail());
            String token = jwtUtility.generateToken(userDetails);

            // ✅ Return only non-sensitive info
            return ResponseEntity.ok(Map.of(
                    "username", userDetails.getUsername(),
                    "role", userDetails.getRole(),
                    "jwt",token
            ));

        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad Credentials!");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestPart("user") String userData,
                                  @RequestPart("file") MultipartFile image) {
        try {
        RegisterRequest registerRequest = new ObjectMapper().readValue(userData, RegisterRequest.class);
        byte[] imageBytes = image.getBytes();
        String code = tempRegistrationService.cacheRegistration(registerRequest, imageBytes);
        emailService.sendVerificationEmail(registerRequest.getEmail(), "Your verification code is: " + code + "\nValid for 5 minutes.", "Account Verification for BusTopia.");
        return ResponseEntity.ok("Verification email sent. Please verify within 5 minutes.");
        } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<?> verify(@RequestParam String code) {
        try {
            CachedRegistration cached = tempRegistrationService.getRegistration(code);
            if (cached == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired code.");
            }
            userService.register(cached.getRegisterRequest(), new MockMultipartFile(
                    "file", "image.jpg", "image/jpeg", cached.getImageBytes()));
            tempRegistrationService.delete(code);
            return ResponseEntity.ok("Registration successful!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Verification failed: " + e.getMessage());
        }
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendResetLink(@Valid @RequestBody ForgotPasswordRequest request){
        UserEntity user = userRepository.findByEmail(request.getEmail());
        if(user == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User doesn't exist!");
        }

        String token = tempPasswordResetService.createResetToken(user.getEmail());
        String resetLink = FRONT_END + "/reset-password/" + token;

        emailService.sendVerificationEmail(
                user.getEmail(),
                "Click here to reset your password: " + resetLink,
                "Password Reset for BusTopia"
        );
        return ResponseEntity.ok("Password reset link has been sent to your email.");
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
                                           @PathVariable String token)
    {
        String email = tempPasswordResetService.getEmailByToken(token);

        if (tempPasswordResetService.isRateLimited(email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Please wait 2 minutes before requesting another reset link.");
        }

        if (email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired reset link.");
        }

        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User no longer exists.");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        tempPasswordResetService.deleteToken(token);

        return ResponseEntity.ok("Password has been successfully reset.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing or invalid Authorization header.");
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtility.extractUserName(token);

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token.");
        }

        UserEntity user = userRepository.findByEmail(email);
        if (user == null || !jwtUtility.validateToken(user, token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized.");
        }

        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "gender", user.getGender(),
                "phone", user.getPhone(),
                "image", user.getImageUrl()
        ));
    }

    @GetMapping("/ping")
    public ResponseEntity<?> pingMe(){
        return ResponseEntity.ok().build();
    }
}
