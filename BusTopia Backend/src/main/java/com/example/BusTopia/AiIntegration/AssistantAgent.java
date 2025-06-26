package com.example.BusTopia.AiIntegration;

import org.springframework.stereotype.Service;

@Service
public class AssistantAgent {

    private final IntentClassifier classifier;
    private final LLMService llm;

    public AssistantAgent(IntentClassifier classifier, LLMService llm) {
        this.classifier = classifier;
        this.llm = llm;
    }

    public String handle(String userInput) {
        IntentType intent = classifier.classify(userInput);
        //System.out.println(intent);
        return switch (intent) {
            case SMALL_TALK, COMPLAIN, REVIEWS ->
                    llm.callOpenAI("Respond naturally to this: " + userInput);

            case FIND_ROUTE ->
                    "Okay! Tell me where you're going from and to.";

            case CHECK_AVAILABLE_BUSES ->
                    "Tell me your source, destination, and time — I’ll check buses for you.";

            case BOOK_TICKET ->
                    "Booking is in progress. Please share the route and time.";

            case CANCEL_TICKET ->
                    "Please provide your booking reference number to cancel.";

            case UNKNOWN ->
                    "Sorry, I didn’t catch that. Could you rephrase?";
        };
    }
}
