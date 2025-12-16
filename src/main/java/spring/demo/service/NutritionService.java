/*
This API service is deprecated, as nutritionix's free API tier is no longer supported. However this was used to fetch all meal price data.
 */

package spring.demo.service;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.io.IOException;
import spring.demo.models.Ingredient;
import spring.demo.models.Recipe;

@Service
public class NutritionService {

	private final WebClient webClient;

	private final ObjectMapper objectMapper;

	@Value("${nutritionix.app-id}")
	private String appID;

	@Value("${nutritionix.app-key}")
	private String appKey;

	public NutritionService(WebClient.Builder builder, ObjectMapper objectMapper) {
		this.webClient = builder.baseUrl("https://trackapi.nutritionix.com").build();
		this.objectMapper = objectMapper;
	}

	public Recipe searchMeal(String meal, Recipe recipe) throws JsonProcessingException {
		
		//Query the meal and parse response
		String searchResponse = webClient.get()
				.uri(uriBuilder -> uriBuilder.path("/v2/search/instant").queryParam("query", meal).build())
				.header("x-app-id", appID).header("x-app-key", appKey).retrieve().bodyToMono(String.class).block();

		return parseNutritionixResponse(searchResponse, recipe);

	}

	public Recipe parseNutritionixResponse(String jsonResponse, Recipe meal)
	        throws IOException, JsonProcessingException {
		
		//Map the meal into JSON and find the first instance of the meal and update meal macros
	    JsonNode root = objectMapper.readTree(jsonResponse);
	    JsonNode commonFoods = root.path("common");
	    JsonNode brandedFoods = root.path("branded");

	    JsonNode firstItem = null;

	    if (commonFoods.isArray() && commonFoods.size() > 0) {
	        firstItem = commonFoods.get(0);  
	    } else if (brandedFoods.isArray() && brandedFoods.size() > 0) {
	        firstItem = brandedFoods.get(0); 
	    }

	    if (firstItem != null) {
	        meal.setCalories(firstItem.path("nf_calories").asInt(0));
	        meal.setProtein(firstItem.path("nf_protein").asInt(0));
	        meal.setFat(firstItem.path("nf_total_fat").asInt(0));
	        meal.setCarbohydrate(firstItem.path("nf_total_carbohydrate").asInt(0));
	    }

	    return meal;
	}

}
