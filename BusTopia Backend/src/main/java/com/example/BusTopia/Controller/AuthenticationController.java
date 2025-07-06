package com.example.BusTopia.Controller;

import com.example.BusTopia.DTOs.Authentication.LoginRequest;
import com.example.BusTopia.DTOs.ForgotPassword.ForgotPasswordRequest;
import com.example.BusTopia.DTOs.Register.CachedRegistration;
import com.example.BusTopia.DTOs.Register.RegisterRequest;
import com.example.BusTopia.DTOs.ResetPassword.ResetPasswordRequest;
import com.example.BusTopia.DTOs.UpdateProfile.UpdateProfileDTO;
import com.example.BusTopia.DatabaseEntity.PasswordResetEntity;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.EmailService.EmailService;
import com.example.BusTopia.MySqlRepositories.PassResetRepository;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import com.example.BusTopia.SecurityConfiguration.JwtUtility;
import com.example.BusTopia.Services.TempPasswordResetService;
import com.example.BusTopia.Services.TempRegistrationService;
import com.example.BusTopia.Services.UserService;
import com.example.BusTopia.Utils.ByteArrayMultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
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
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            UserEntity userDetails = userRepository.findByEmail(loginRequest.getEmail());
            String token = jwtUtility.generateToken(userDetails);

            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(true) // Required for SameSite=None
                    .path("/")
                    .sameSite("None") // Required for cross-origin (OAuth)
                    .maxAge(Duration.ofHours(6))
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of(
                    "username", userDetails.getUsername(),
                    "role", userDetails.getRole()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestPart("user") String userData,
                                  @RequestPart(value="file" , required = false) MultipartFile image) {
        try {
            RegisterRequest registerRequest = new ObjectMapper().readValue(userData, RegisterRequest.class);
            byte[] imageBytes = (image != null && !image.isEmpty()) ? image.getBytes() : null;

            if(userRepository.findByEmail(registerRequest.getEmail()) != null)
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Registration failed! Email already exists.");

            String code = tempRegistrationService.cacheRegistration(registerRequest, imageBytes);

            String frontendBaseUrl = FRONT_END + "/verify";

            String verificationLink = frontendBaseUrl + "?code=" + code + "&email=" + URLEncoder.encode(registerRequest.getEmail(), StandardCharsets.UTF_8);

            String message = "Welcome to BusTopia!\n\n"
                    + "Please verify your account by clicking the link below:\n"
                    + verificationLink + "\n\n"
                    + "This link is valid for 5 minutes.";

            emailService.sendVerificationEmail(
                registerRequest.getEmail(),
                message,
                "Account Verification for BusTopia"
            );
            return ResponseEntity.ok("Verification email sent. Please verify within 5 minutes.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

//    @GetMapping("/verify-registration")
//    public ResponseEntity<?> verify(@RequestParam String code, @RequestParam String email) {
//        try {
//            CachedRegistration cached = tempRegistrationService.getRegistration(code);
//            if (cached == null || !cached.getRegisterRequest().getEmail().equalsIgnoreCase(email)) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired link.");
//            }
//
//            MultipartFile imageFile = null;
//            byte[] imageBytes = cached.getImageBytes();
//            if (imageBytes != null && imageBytes.length > 0) {
//                // Replace MockMultipartFile with our new implementation
//                imageFile = new ByteArrayMultipartFile(
//                        imageBytes,
//                        "file",
//                        "user-image.jpg",
//                        "image/jpeg"
//                );
//            }
//
//            userService.register(cached.getRegisterRequest(), imageFile);
//            tempRegistrationService.delete(code);
//            return ResponseEntity.ok("Registration successful!");
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Verification failed: " + e.getMessage());
//        }
//    }


    @GetMapping("/verify-registration")
    public ResponseEntity<?> verify(@RequestParam String code, @RequestParam String email) {
        try {
            CachedRegistration cached = tempRegistrationService.getRegistration(code);
            if (cached == null || !cached.getRegisterRequest().getEmail().equalsIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired link.");
            }

            MultipartFile imageFile = null;
            byte[] imageBytes = cached.getImageBytes();
            if (imageBytes != null && imageBytes.length > 0) {
                // Replace MockMultipartFile with our new implementation
                imageFile = new ByteArrayMultipartFile(
                        imageBytes,
                        "file",
                        "user-image.jpg",
                        "image/jpeg"
                );
            }

            userService.register(cached.getRegisterRequest(), imageFile);
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
    public ResponseEntity<?> getCurrentUser(@CookieValue(name = "jwt", required = true) String token) {
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No JWT cookie found.");
        }
        String email = jwtUtility.extractUserName(token);

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token.");
        }

        UserEntity user = userRepository.findByEmail(email);
        if (user == null || !jwtUtility.validateToken(user, token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized.");
        }

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("email", user.getEmail());
        userMap.put("username", user.getName());
        userMap.put("role", user.getRole());
        userMap.put("gender", user.getGender());
        userMap.put("phone", user.getPhone());
        userMap.put("image", user.getImageUrl());
        userMap.put("id", user.getId());

        return ResponseEntity.ok(userMap);
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Clear the JWT cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Expire immediately
                .sameSite("None")
                .build();

        response.setHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }

    @PutMapping("/user/update")
    public ResponseEntity<?> updateUserInfo(
            @RequestPart("user") String userJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Principal principal) {
        try {


            ObjectMapper mapper = new ObjectMapper();
            UpdateProfileDTO updateRequest = mapper.readValue(userJson, UpdateProfileDTO.class);

            String email = principal.getName();

            UserEntity updatedUser = userService.updateUserProfile(email, updateRequest, file);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("email", updatedUser.getEmail());
            userMap.put("username", updatedUser.getName());
            userMap.put("role", updatedUser.getRole());
            userMap.put("gender", updatedUser.getGender());
            userMap.put("phone", updatedUser.getPhone());
            userMap.put("imageUrl", updatedUser.getImageUrl());

            return ResponseEntity.ok(userMap);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Profile update failed: " + e.getMessage());
        }
    }


    @GetMapping("/ping")
    public ResponseEntity<?> pingMe(){
        return ResponseEntity.ok().build();
    }
}
