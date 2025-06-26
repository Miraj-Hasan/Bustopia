package com.example.BusTopia.AiIntegration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai-assistant")
public class AssistantController {

    private final AssistantAgent agent;

    public AssistantController(AssistantAgent agent) {
        this.agent = agent;
    }

    @PostMapping
    public ResponseEntity<String> handle(@RequestBody Map<String, String> body) {
        String input = body.get("message");
//        System.out.println(input);
        return ResponseEntity.ok(agent.handle(input));
    }

    @GetMapping("/health")
    public ResponseEntity<String> checkOpenAI() {
        try {
            String response = agent.handle("hello");
            return ResponseEntity.ok("✅ OpenAI is reachable. Sample response: " + response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("❌ Failed to connect to OpenAI: " + e.getMessage());
        }
    }
}
