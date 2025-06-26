package com.example.BusTopia.AiIntegration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LLMService {

//    @Value("${huggingface.api.key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();
    private final MediaType mediaType = MediaType.get("application/json");

    public String callOpenAI(String prompt) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode payload = mapper.createObjectNode();
            payload.put("inputs", prompt);

            String jsonBody = mapper.writeValueAsString(payload);

            Request request = new Request.Builder()
                    .url("https://api-inference.huggingface.co/models/openai-community/gpt2") // ✅ switched model
                    .post(RequestBody.create(jsonBody, mediaType))
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
                System.out.println("HuggingFace error: " + response.code() + " - " + response.body().string());
                return "UNKNOWN";
            }

            JsonNode root = mapper.readTree(response.body().string());
            return root.get(0).get("generated_text").asText().trim(); // ✅ no change in return

        } catch (Exception e) {
            e.printStackTrace();
            return "UNKNOWN";
        }
    }
}
