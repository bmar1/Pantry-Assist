package spring.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import spring.demo.models.Ingredient;

import java.util.Map;

@Service
public class PriceService {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private static final Logger log = LoggerFactory.getLogger(PriceService.class);



    @Autowired
    private WalmartServiceHeaders serviceHeader;


    public PriceService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://developer.api.walmart.com/").build();
    }

    public Ingredient getIngredient(String ing) throws Exception {


        String timestamp = serviceHeader.getWMConsumerIntimestamp();


        String searchResponse = String.valueOf(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api-proxy/service/affil/product/v2/search")
                        .queryParam("query", ing)
                        .build())
                .headers(headers -> {
                    headers.set("WM_CONSUMER.ID", serviceHeader.getWMConsumerId());
                    headers.set("WM_CONSUMER.INTIMESTAMP", timestamp);
                    headers.set("WM_SEC.KEY_VERSION", serviceHeader.getWMSecKeyVersion());

                    try {
                        headers.set("WM_SEC.AUTH_SIGNATURE", serviceHeader.
                                getWMSecAuthSignature(timestamp));
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }).retrieve().onStatus(HttpStatusCode::isError, clientResponse -> {
                    return clientResponse.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                return Mono.error(new RuntimeException("API returned error: " + errorBody));
                            });
                })
                .bodyToMono(String.class)
                .block());
        log.info("Fetching ingredient: {}", ing);
        log.debug("API Response for '{}': {}", ing, searchResponse);


        // Check if response is actually JSON
        if (searchResponse == null || searchResponse.trim().isEmpty()) {
            log.error("Empty response from API for ingredient: {}", ing);
            return null;
        }

        if (!searchResponse.trim().startsWith("{") && !searchResponse.trim().startsWith("[")) {
            log.error("Non-JSON response from API for ingredient '{}': {}", ing, searchResponse);
            return null;
        }



        return parseResponse(searchResponse, ing);

    }




    public Ingredient parseResponse(String jsonResponse, String ing)
            throws IOException, JsonProcessingException {

        //Map the response to find the closest ingredient and its price, url link, totalServings in box etc
        JsonNode root = mapper.readTree(jsonResponse);

        if (root.has("errors")) {
            log.error("API returned errors for '{}': {}",
                    ing, root.path("errors").toString());
            return null;
        }

        JsonNode items = root.path("items");
        if (items.isMissingNode()) {
            log.warn("No 'items' field in response for '{}'", ing);
            return null;
        }

        if (!items.isArray()) {
            log.warn("'items' field is not an array for '{}'", ing);
            return null;
        }

        if (items.isEmpty()) {
            log.warn("No items found for ingredient: {}", ing);
            return null;
        }

        JsonNode first = items.get(0);
        System.out.println(first.toPrettyString());
        Ingredient ingredient = new Ingredient();


        System.out.println(first);

        ingredient.setName(first.path("name").asText(null));
        ingredient.setTotalPrice(first.path("salePrice").asDouble(0.0));
        ingredient.setProductUrl(first.path("affiliateAddToCartUrl").asText(null));
        ingredient.setImageUrl(first.path("largeImage").asText(null));
        ingredient.setCategory(first.path("categoryPath").asText(null));
        ingredient.setServingsPerContainer(first.path("size").asText("0"));
        ingredient.setServingSize(String.valueOf(1));




        return ingredient;
    }
}
