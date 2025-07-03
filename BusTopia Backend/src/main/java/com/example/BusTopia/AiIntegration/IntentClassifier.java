package com.example.BusTopia.AiIntegration;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IntentClassifier {

    private final LLMService llmService;

    public IntentClassifier(LLMService llmService) {
        this.llmService = llmService;
    }

    public List<Object> classify(String userInput) {
        String prompt = buildPrompt(userInput);
        //System.out.println(prompt);
        String response = llmService.callOpenAI(prompt);
        //System.out.println(response);
        return List.of(mapResponse(response),userInput);
    }

    private String buildPrompt(String conversation) {
        return """
                You are a smart AI assistant that classifies the user's intent based on the most recent user message in the conversation history.

                The full conversation is shown below. Each line starts with either "user:" or "bot:".

                Classify ONLY the **latest user message**, and base your classification on the context of the whole conversation.
                    
                ⚠️ Do NOT classify based on a topic that has already been resolved by the bot in an earlier response.In that case only focus of last message by user.
                ✅ Do classify follow-up messages (like when the user gives more info to answer a previous question).
                Rule: If the most recent user message is a greeting or polite expression or compliments like "hello", "hi", "thanks", "thank you", "thanks a lot", "cool", "okay", "got it", "Cute" etc., then classify it as SMALL_TALK — regardless of the rest of the conversation.
                    
               ❗IMPORTANT:
                If the user starts with a casual greeting or small talk (e.g., “hey”, “hello”, “what’s up”) but then follows up with a **task-based question** (e.g., booking, cancelling, pricing), classify the latest message according to that task.
                                
                Do NOT let previous small talk override the classification of the most recent message.
                                
                Valid intent types:
                - FIND_ROUTE
                - BOOK_TICKET
                - CANCEL_TICKET
                - SMALL_TALK
                - COMPLAIN
                - UNKNOWN
                - REVIEWS
                - CHECK_AVAILABLE_BUSES
                - COST_INQUIRY

                Examples:

                Conversation:
                user: I want to go to Sylhet
                bot: Sure! When do you want to travel?
                user: Hello
                → SMALL_TALK

                Conversation:
                user: I want to book a ticket
                bot: Please enter source and destination.
                user: How much is the fare?
                → COST_INQUIRY

                Conversation:
                user: What's the cost of Dhaka tickets?
                bot: Tell me your source & destination — I’ll check prices for you.
                user: Bogura to Dhaka
                → COST_INQUIRY
                   
                Conversation:
                user: What’s the cost of Dhaka to Bogura?
                bot: Bus A, Non-AC , 900. Bus B, AC , 600
                user: Thanks a lot
                → SMALL_TALK
                
                conversation:
                user:are there any buses from Dhaka to Bogura?
                bot:could you have any specific time in your mind?
                user:in the morning
                -> CHECK_AVAILABLE_BUSES
                
                conversation:
                user: blah blah blah
                bot: blah blah blah
                user: are there any buses available for bogura?
                -> CHECK_AVAILABLE_BUSES
                
                conversation:
                bot: blah blah blah
                user: how do i cancel ticket?
                -> CANCEL_TICKET
                
                Now classify the **most recent user message** in this conversation:
                %s

                Respond ONLY with one of the intent types in ALL CAPS (e.g., FIND_ROUTE). Do NOT explain.
                """.formatted(conversation);
    }

    private IntentType mapResponse(String response) {
        try {
            return IntentType.valueOf(response.trim().toUpperCase());
        } catch (Exception e) {
            return IntentType.UNKNOWN;
        }
    }
}
