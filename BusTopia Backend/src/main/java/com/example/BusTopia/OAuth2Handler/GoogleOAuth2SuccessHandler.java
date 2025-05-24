package com.example.BusTopia.OAuth2Handler;

import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import com.example.BusTopia.SecurityConfiguration.JwtUtility;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Value("${frontend.origin}")
    private String FRONT_END_ORIGIN;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtility jwtUtility;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        // Create user if doesn't exist
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            user = new UserEntity();
            user.setEmail(email);
            user.setUserName(oauthUser.getAttribute("name"));
            user.setRole("ROLE_USER");
            userRepository.save(user);
        }

        // Generate JWT
        String jwt = jwtUtility.generateToken(user);

        // ✅ Set JWT in Secure HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .httpOnly(true)
                .secure(true) // Make sure HTTPS is used in production
                .path("/")
                .sameSite("None") // Required for cross-site cookie
                .maxAge(60 * 60) // 1 hour expiry
                .build();

        response.setHeader("Set-Cookie", cookie.toString());

        // ✅ Redirect to frontend without token in URL
        response.sendRedirect(FRONT_END_ORIGIN + "/oauth-success");
    }
}
