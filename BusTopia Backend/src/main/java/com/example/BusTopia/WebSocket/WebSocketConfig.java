package com.example.BusTopia.WebSocket;

import com.example.BusTopia.AiIntegration.AssistantAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

// WebSocketConfig.java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Value("${frontend.origin}")
    String FRONTEND_ORIGIN;

    @Autowired
    private AssistantAgent assistantAgent;


    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatWebSocketHandler(assistantAgent), "/chat")
                .setAllowedOrigins("https://localhost:3000","https://172.167.170.46:3000","https://app.172.167.170.46.nip.io:3000",FRONTEND_ORIGIN);
    }
}
