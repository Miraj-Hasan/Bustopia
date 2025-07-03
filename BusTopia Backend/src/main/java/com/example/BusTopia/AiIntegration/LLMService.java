package com.example.BusTopia.AiIntegration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LLMService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    private final OkHttpClient client = new OkHttpClient();
    private final MediaType mediaType = MediaType.get("application/json");

    public String callOpenAI(String prompt) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            ObjectNode userMessage = mapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);

            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", "llama3-8b-8192"); // ✅ Groq supports llama3-8b/70b or mixtral
            payload.set("messages", mapper.createArrayNode().add(userMessage));
            payload.put("temperature", 0.2);

            String jsonBody = mapper.writeValueAsString(payload);

            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(RequestBody.create(jsonBody, mediaType))
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
                System.out.println("Groq error: " + response.code() + " - " + response.body().string());
                return "UNKNOWN";
            }

            JsonNode root = mapper.readTree(response.body().string());
            return root.path("choices").get(0).path("message").path("content").asText().trim();

        } catch (Exception e) {
            e.printStackTrace();
            return "UNKNOWN";
        }
    }
}
