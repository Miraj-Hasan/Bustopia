package com.example.BusTopia.AiAssistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    @Value("${openai.api-key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGPT(String userMessage) {
        try {
            String requestJson = buildRequest(userMessage);

            Request request = new Request.Builder()
                    .url("https://api.openai.com/v1/chat/completions")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(
                            requestJson,
                            MediaType.get("application/json; charset=utf-8")
                    ))
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new RuntimeException("Failed GPT response: " + response);
                }

                String responseBody = response.body().string();
                return parseReply(responseBody);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Oopsie! Something went wrong >_<";
        }
    }

    private String buildRequest(String userMessage) throws Exception {
        Map<String, Object> message = Map.of(
                "role", "user",
                "content", userMessage
        );

        Map<String, Object> request = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(message),
                "temperature", 0.7
        );

        return objectMapper.writeValueAsString(request);
    }

    private String parseReply(String responseJson) throws Exception {
        JsonNode root = objectMapper.readTree(responseJson);
        return root.get("choices").get(0).get("message").get("content").asText();
    }
}
