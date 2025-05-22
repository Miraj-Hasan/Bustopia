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
import java.util.HashMap;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Value("${frontend.origin}")
    private String FRONT_END_ORIGIN;

    @Value("${backend.origin}")
    private String BACK_END_ORIGIN;

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
        if (userRepository.findByEmail(email) == null) {
            UserEntity newUser = new UserEntity();
            newUser.setEmail(email);
            newUser.setUserName(oauthUser.getAttribute("name"));
            newUser.setRole("ROLE_USER");
            userRepository.save(newUser);
        }

        // Generate JWT
        String jwt = jwtUtility.generateToken(userRepository.findByEmail(email));

        // ✅ Redirect to frontend with token in URL
        String redirectUrl = FRONT_END_ORIGIN + "/oauth-success?token=" + jwt;
        response.sendRedirect(redirectUrl);
    }

}
