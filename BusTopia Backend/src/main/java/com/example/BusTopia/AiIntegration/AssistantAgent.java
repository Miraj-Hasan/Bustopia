package com.example.BusTopia.AiIntegration;

import com.example.BusTopia.DatabaseEntity.Bus;
import com.example.BusTopia.DatabaseEntity.PriceMapping;
import com.example.BusTopia.DatabaseEntity.Route;
import com.example.BusTopia.MySqlRepositories.BusRepository;
import com.example.BusTopia.MySqlRepositories.PriceMappingRepository;
import com.example.BusTopia.MySqlRepositories.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AssistantAgent {

    private final IntentClassifier classifier;
    private final LLMService llm;

    private final PriceMappingRepository priceMappingRepository;

    @Autowired
    private  BusRepository busRepository;

    @Autowired
    private RouteRepository routeRepository;

    public AssistantAgent(IntentClassifier classifier, LLMService llm,PriceMappingRepository priceMappingRepository ) {
        this.classifier = classifier;
        this.llm = llm;
        this.priceMappingRepository=priceMappingRepository;
    }
    public String handle(String userInput) {

        String trimmed = userInput.substring(1, userInput.length() - 1);
        String[] parts = trimmed.split("\",\"");

        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].replaceAll("^\"|\"$", "");
        }

        String last = parts[parts.length - 1].trim();

        List<Object> response = classifier.classify(userInput);
        IntentType intent = (IntentType) response.get(0);
        System.out.println(intent);

        switch (intent) {
            case SMALL_TALK:
                return llm.callOpenAI("Respond naturally to this ignoring the 'user :' at the start : " + last);

            case UNKNOWN:
                return "Sorry, I didn’t catch that. Could you rephrase?";

            case CANCEL_TICKET:
                return "Unfortunately tickets can't be cancelled online! Please reach out to nearest bus counter with your ticket.";

            case BOOK_TICKET:
                return "Please Navigate to 'Book Ticket' section in the sidebar on the left of your screen & select you source,destination & datetime";

            case REVIEWS:
                return "Please Navigate to 'Reviews' section on the left sidebar & select desired bus to see customer reviews.";

            case COMPLAIN:
                return "Navigate to 'Reviews' section on sidebar , select 'by buses travelled' you can add a complaint/review there.";

            case COST_INQUIRY:
                //System.out.println(last);

                String output =  llm.callOpenAI(
                        """
                                Your task is to extract the source and destination city names from the sentence below. The sentence starts with 'user:', which you must ignore.
                                           
                                ✳️ Rules:
                                - You must extract **exactly two valid place names**: one source and one destination.
                                - If the sentence contains **only one** place, or does **not clearly mention two distinct places**, return exactly this string: UNCLEAR
                                - Do **not guess**, do **not make up** missing locations, and do **not fill in placeholders** like 'unclear'.
                                - If the sentence has **both source and destination** Output must be in this format only (all lowercase, no labels, no extra words)-> source:destination
                                - If **either of the source or destination or both** is missing Output must be in this format only -> UNCLEAR
                                - Do not include anything else — no punctuation, no extra text, and no explanations.
                                
                                example :
                                user : what are Dhaka-Bogura ticket prices?
                                output : Dhaka:Bogura
                                
                                example :
                                user : how much Dhaka to Bogura ticket cost?
                                output : Dhaka:Bogura
                                
                                example : How much Bogura tickets cost?
                                output : UNCLEAR
                                           
                                📥 Input: %s""".formatted(last)

                );
                if(output.equalsIgnoreCase("UNCLEAR"))
                    return "Tell me your source & destination — I’ll check prices for you.";

                System.out.println(output);
                String[] srcDst = output.split(":");
                for(String s : srcDst) {
                    if(s.equalsIgnoreCase("unclear"))
                        return "Tell me your source & destination — I’ll check prices for you.";
                }

                List<PriceMapping> priceMapping = priceMappingRepository.findByStop1IgnoreCaseAndStop2IgnoreCase(srcDst[0].trim(),srcDst[1].trim());
                if(priceMapping.size() == 0)
                    return "Sorry, we don't have any bus service from mentioned source to destination.";

                output = "";
                for( PriceMapping pm : priceMapping){
                    String category = pm.getCategory();
                    output += ( "category : " + category + ", price : " + pm.getPrice()+"\n") ;
                }

                return output;

            case FIND_ROUTE, CHECK_AVAILABLE_BUSES:
                String reply =  llm.callOpenAI(
                        """
                 Your task is to extract the **source**, **destination**, and **time** from the conversation below. Each sentence starts with 'user:' or 'bot:', which you must ignore.
                 
                 ✳️ Extraction Goal:
                 - Extract exactly three elements:
                   1. Source (valid place name)
                   2. Destination (valid place name)
                   3. Time (e.g., 'tomorrow', 'morning', 'night', '7:30', 'evening', 'noon')
                 
                 ✅ Output Format:
                 - Only output: source:destination:time
                 - All lowercase
                 - No extra text
                 - No punctuation
                 - No symbols
                 - No explanations
                 - **No arrows, quotes, or formatting**
                 
                 ❗ Missing Info Handling:
                 - If only **time is missing**, output: source:destination:unclear
                 - If only **source is missing**, output: unclear:destination:time
                 - If only **destination is missing**, output: source:unclear:time
                 - If **two or more elements are missing**, output exactly: UNCLEAR
                 
                 🚫 Do not guess or invent any values
                 🚫 Do not include partial fillers unless they exactly follow the rules
                 🚫 Do not return anything except the final result (no punctuation or formatting)
                 
                 ---
                 
                 Examples:
                 
                 Conversation:
                 user: what are available buses ticket prices?
                 UNCLEAR
                 
                 Conversation:
                 user: what are available buses ticket prices from Dhaka to Bogura tomorrow?
                 dhaka:bogura:tomorrow
                 
                 Conversation:
                 user: how much are tickets from Dhaka to Bogura?
                 dhaka:bogura:unclear
                 
                 Conversation:
                 user: when is the next bus to Dhaka?
                 unclear:dhaka:unclear
                 
                 Conversation:
                 user: show me buses to Sylhet tomorrow
                 unclear:sylhet:tomorrow
                 
                 Conversation:
                 user: I want to go from Khulna to Rajshahi on Monday at 6pm
                 khulna:rajshahi:monday 6pm
                 
                 Conversation:
                 user: How much are Khulna tickets?
                 unclear:khulna:unclear
                 
                 ---
                 
                 Conversation:
                 %s
                 """.formatted(userInput)


                );
                System.out.println(reply);
                String[] data = reply.split(":");
                //for(String s:data) System.out.println(s);

                if(data[0].equalsIgnoreCase("unclear") || data[1].equalsIgnoreCase("unclear"))
                    return "Can you clarify your source and destination please?";
                if(data[2].equalsIgnoreCase("unclear"))
                    return "Do you have any preferred time? (morning/noon/evening/night)?";

                //all data are available as source destination and time

                String source = capitalize(data[0].trim());
                String destination = capitalize(data[1].trim());

                List<Route> routes = routeRepository.findRoutesContainingBothStops(source,destination);
                if(routes.size() == 0)
                    return "Sorry, we don't have any bus service from mentioned source to destination.";

                String timeCategory = data[2].toLowerCase();
                List<String> responses = new ArrayList<>();

                List<Bus> buses = busRepository.findByRouteIn(routes);

                for (Bus bus :buses ) {
                    System.out.println(bus.getStartTime());
                    LocalTime time = bus.getStartTime();

                    boolean match = switch (timeCategory) {
                        case "morning" -> !time.isBefore(LocalTime.of(5, 0)) && !time.isAfter(LocalTime.of(11, 0)); // 5AM–11AM
                        case "noon"    -> !time.isBefore(LocalTime.of(12, 0)) && !time.isAfter(LocalTime.of(16, 0)); // 12PM–4PM
                        case "evening" -> !time.isBefore(LocalTime.of(17, 0)) && !time.isAfter(LocalTime.of(19, 0)); // 5PM–7PM
                        case "night"   -> time.isAfter(LocalTime.of(21, 0)) || time.isBefore(LocalTime.of(1, 0));    // 9PM–1AM (wraps around)
                        default        -> false;
                    };

                    if (match) {
                        responses.add(bus.getCompanyName() + " — " + time.toString()); // e.g. "Shyamoli Paribahan — 17:30"
                    }
                }
                if(responses.size() == 0) {
                    return "There are no available buses from "+ data[0] + " to " + data[1] + " at " + data[2];
                }
                return String.join("\n", responses);

            case BUS_INQUIRY:
                String busName =  llm.callOpenAI(
                        """
                            Your task is to extract the **bus or company name** from the sentence below. The sentence starts with 'user:', which you must ignore.
                            
                            ✳️ Rules:
                            - You must extract **only one** valid bus or transport company name.
                            - If the sentence clearly mentions a known bus/company name (e.g., "Green Line", "Shyamoli Paribahan", "Hanif", "Shohagh"), return that exact name.
                            - If the sentence does **not clearly** mention a company name, return exactly: UNCLEAR
                            - Do **not guess**, do **not infer** based on route, category, or price.
                            - Output **must be** the company name string exactly as written (preserve spaces and case).
                            - Do **not** include anything else — no punctuation, no extra text, no labels, no explanations.
                            
                            📥 Input: %s
                            """.formatted(last)

                );

                if(busName.equalsIgnoreCase("UNCLEAR"))
                    return "Could you please specify what bus are you looking for?";

                Page<Bus> p = busRepository.findSpecificCompanyBus(busName, Pageable.ofSize(1));
                if(p.hasContent()) return "Of course! " + busName + " tickets are available on our platform.";
                else return "Sorry, we don't have " + busName + " tickers available on our platform.";

            default:
                return "Sorry, something went wrong while processing your request.";
        }
    }
    private static String capitalize(String input) {
        if (input == null || input.isEmpty()) return input;
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
    }
}
