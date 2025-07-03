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
                You are a smart AI assistant that classifies the user's intent based on the most recent user message in the conversation.           
                Each line starts with "user:" or "bot:". Only classify the **latest user message** using the full conversation context.
                            
                🧠 GENERAL RULES:
                - Focus on what the user is asking for in their **last message only**.
                - Ignore topics that were already completed/resolved by the bot.
                - Always prioritize the user's latest request.
                - If the last message is **a greeting, compliment, or polite expression** (e.g., "hi", "hello", "thanks", "okay", "cool"), classify it as SMALL_TALK
                   This rule always takes priority over previous queries like COST_INQUIRY or BOOK_TICKET — if the last user input matches the above tone, treat it as **SMALL_TALK**.
                                  
                📌 CLASSIFICATION LOGIC:
                - If message includes **cancel, remove, undo booking**, it's → CANCEL_TICKET
                - If message includes **book, reserve, buy ticket** (but NOT about cost), it's → BOOK_TICKET
                - If message includes **price, cost, fare, how much**, it's → COST_INQUIRY
                - If message is about **routes** (from X to Y, how to go), it's → FIND_ROUTE
                - If message is about **which buses are available**, it's → CHECK_AVAILABLE_BUSES
                - If message is about **bus names**, or asks for specific company/service (e.g., Shyamoli), it's → BUS_INQUIRY
                - If message is about **reviews, ratings, satisfaction**, it's → REVIEWS
                - If message is about **complaining**, bad experience, or how to submit a complaint → COMPLAIN
                            
                INTENT TYPES:
                - FIND_ROUTE
                - BOOK_TICKET
                - CANCEL_TICKET
                - SMALL_TALK
                - COMPLAIN
                - UNKNOWN
                - REVIEWS
                - CHECK_AVAILABLE_BUSES
                - COST_INQUIRY
                - BUS_INQUIRY
                            
                ✅ EXAMPLES:                            
                Conversation:
                user: Can I cancel the ticket later?  
                → CANCEL_TICKET
                            
                Conversation:
                user: how/where I book a ticket here?  
                → BOOK_TICKET
                            
                Conversation:
                user: How much are Dhaka-Bogura tickets?  
                → COST_INQUIRY
      
                Conversation:
                user: Are there buses to Sylhet?  
                → CHECK_AVAILABLE_BUSES
                            
                Conversation:
                user: What's the cost of Dhaka tickets?  
                bot: Tell me your source & destination  
                user: Bogura to Dhaka  
                → COST_INQUIRY
                            
                Conversation:
                user: Where do I get the bus from Dhaka to Sylhet?  
                → FIND_ROUTE
                                
                Conversation:
                user: What’s the cost of Dhaka tickets?
                bot: Bus : Shyamoli Paribahan , category : Non-AC, price : 550.0\s
                user: Are GreenLine buses available here?
                → BUS_INQUIRY

                Now classify the most recent user message in this conversation:
                %s                            
                Respond ONLY with one of the intent types in ALL CAPS. Do NOT explain.
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
