package com.example.BusTopia.Controller;

import com.example.BusTopia.AiAssistant.OpenAIService;
import com.example.BusTopia.DTOs.Chat.ChatRequest;
import com.example.BusTopia.DTOs.Chat.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private OpenAIService openAIService;

    @PostMapping
    public ResponseEntity<ChatResponse> handleChat(@RequestBody ChatRequest request) {
        String reply = openAIService.askGPT(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
