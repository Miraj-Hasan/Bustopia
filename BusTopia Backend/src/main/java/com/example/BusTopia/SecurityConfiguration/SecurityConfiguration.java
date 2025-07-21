package com.example.BusTopia.SecurityConfiguration;

import com.example.BusTopia.OAuth2Handler.GoogleOAuth2SuccessHandler;
import com.example.BusTopia.Services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@EnableWebSecurity
@Configuration
public class SecurityConfiguration {

    @Value("${frontend.origin}")
    String FRONTEND_ORIGIN;

    @Autowired
    public CustomUserDetailsService userDetailsService;

    @Autowired
    public JwtAuthFilter jwtAuthFilter;

    @Autowired
    public GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowedOrigins(List.of("https://172.167.170.46:3000",
//                "https://app.172.167.170.46.nip.io:3000",
//                FRONTEND_ORIGIN));
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider getAuthenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain getSecurityFilterChain(HttpSecurity security) throws Exception{
        return security
                .cors( cors -> cors.configurationSource(corsConfigurationSource())  )
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm->sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(getAuthenticationProvider())
                .addFilterBefore(jwtAuthFilter , UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/login",
                                        "/api/register",
                                        "/api/verify-registration",
                                        "/api/forgot-password",
                                        "/api/reset-password/*",
                                        "/api/ping",
                                        "/ai-assistant/health",
                                        "/ai-assistant",                 //need to remove after testing
                                        "/test/redis-health",
                                        "/test/s3-health",
                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/actuator/info",
                                        "/actuator/health",
                                        "/actuator/**",
                                        "/api/logout",
                                        "/api/payment/**",
                                        "/api/me",
                                        "/login/oauth2/**",
                                        "/oauth2/**").permitAll()
                                .anyRequest().authenticated()
                        )
                .oauth2Login(oauth2->oauth2.successHandler(googleOAuth2SuccessHandler))
                .build();
    }
}
