package com.example.BusTopia.WebSocket;

import com.example.BusTopia.AiIntegration.AssistantAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;

// ChatWebSocketHandler.java
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final AssistantAgent assistantAgent;

    public ChatWebSocketHandler(AssistantAgent assistantAgent) {
        this.assistantAgent = assistantAgent;
    }
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws  IOException {
        String incoming = message.getPayload();
        //System.out.println(incoming);
        // Simulated bot logic — echo with prefix
        String response = assistantAgent.handle(incoming);
        System.out.println(response);
        session.sendMessage(new TextMessage(response));
    }
}
