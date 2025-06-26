package com.example.BusTopia.AiIntegration;

import org.springframework.stereotype.Service;

@Service
public class IntentClassifier {

    private final LLMService llmService;

    public IntentClassifier(LLMService llmService) {
        this.llmService = llmService;
    }

    public IntentType classify(String userInput) {
        String prompt = buildPrompt(userInput);
        //System.out.println(prompt);
        String response = llmService.callOpenAI(prompt);
        //System.out.println(response);
        return mapResponse(response);
    }

    private String buildPrompt(String userInput) {
        return """
        You are a smart AI assistant. Your task is to classify the user input into one of the following intent types:

        - FIND_ROUTE
        - BOOK_TICKET
        - CANCEL_TICKET
        - SMALL_TALK
        - COMPLAIN
        - UNKNOWN
        - REVIEWS
        - CHECK_AVAILABLE_BUSES

        Examples:
        "Hello" → SMALL_TALK
        "I want to go from Dhaka to Sylhet" → FIND_ROUTE
        "Book me a ticket please" → BOOK_TICKET
        "Cancel my booking" → CANCEL_TICKET
        "This app sucks" → COMPLAIN
        "Thanks a lot!" → SMALL_TALK
        "Can I see available buses for tomorrow?" → CHECK_AVAILABLE_BUSES
        "Leave a review: great experience" → REVIEWS

        Now classify this message:
        "%s"

        Respond ONLY with the intent name in ALL CAPS (e.g. FIND_ROUTE).
        """.formatted(userInput);
    }

    private IntentType mapResponse(String response) {
        try {
            return IntentType.valueOf(response.trim().toUpperCase());
        } catch (Exception e) {
            return IntentType.UNKNOWN;
        }
    }
}
