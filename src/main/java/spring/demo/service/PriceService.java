package spring.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import spring.demo.models.Ingredient;
import spring.demo.models.Recipe;

@Service
public class PriceService {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private WalmartServiceHeaders serviceHeader = new WalmartServiceHeaders();


    public PriceService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://developer.api.walmart.com/").build();
    }

    public Ingredient getIngredient(String ing) throws Exception {

        String searchResponse = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api-proxy/service/affil/product/v2/items").queryParam("query", ing).build())
                .header("WM_SEC.KEY_VERSION", serviceHeader.getWMSecKeyVersion())
                .header("WM_CONSUMER.ID", serviceHeader.getWMConsumerId()).
                header("WM_CONSUMER.INTIMESTAMP", serviceHeader.getWMConsumerIntimestamp()).
                header("WM_SEC.AUTH_SIGNATURE", serviceHeader.getWMSecAuthSignature(serviceHeader.getWMConsumerIntimestamp())).
                retrieve().bodyToMono(String.class).block();

        return parseResponse(searchResponse);
    }

    public Ingredient parseResponse(String jsonResponse)
            throws IOException, JsonProcessingException {

        //Map the response to find the closest ingredient and its price, url link, totalServings in box etc
        JsonNode root = mapper.readTree(jsonResponse);
        JsonNode items = root.path("items");
        if (!items.isArray() || items.size() == 0) {
            return null; // no items returned
        }

        JsonNode first = items.get(0);
        Ingredient ingredient = new Ingredient();

        ingredient.setName(first.path("name").asText(null));
        ingredient.setTotalPrice(first.path("salePrice").asDouble(0.0));
        ingredient.setUrl(first.path("productUrl").asText(null));
        ingredient.setUrl(first.path("thumbnailImage").asText(null));
        ingredient.setCategory(first.path("categoryPath").asText(null));

        JsonNode nut = first.path("nutrition");
        if (!nut.isMissingNode() && nut.has("calories")) {
            ingredient.setCalories((double) nut.path("calories").asInt());
        }

        return ingredient;
    }
}
