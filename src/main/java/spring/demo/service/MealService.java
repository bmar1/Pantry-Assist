package spring.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import spring.demo.models.Recipe;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class MealService {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public MealService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://www.themealdb.com/api/json/v1/1").build();
    }

    public Recipe getRandomMeal() throws Exception {
        String response = webClient.get()
                .uri("/random.php")
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return parseRecipeFromJson(response);
    }

    public Recipe getMealByName(String name) throws Exception {
        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/search.php").queryParam("s", name).build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return parseRecipeFromJson(response);
    }

    public ArrayList<Recipe> getMealsByIngredient(String ingredient) throws Exception {
        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/filter.php").queryParam("i", ingredient).build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode root = mapper.readTree(response);
        JsonNode meals = root.get("meals");
        ArrayList<Recipe> recipes = new ArrayList<>();

        if (meals != null && meals.size() > 0) {
            for (JsonNode mealSummary : meals) {
                String id = mealSummary.get("idMeal").asText();
                Recipe fullRecipe = getMealById(id); // fetch full recipe details
                if (fullRecipe != null) {
                    recipes.add(fullRecipe);
                }
            }
        }

        return recipes;
    }

    public ArrayList<Recipe> getMealsByCategory(String category) throws Exception {
        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/filter.php").queryParam("c", category).build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode root = mapper.readTree(response);
        JsonNode meals = root.get("meals");
        ArrayList<Recipe> recipes = new ArrayList<>();

        if (meals != null && meals.size() > 0) {
            for (JsonNode mealSummary : meals) {
                String id = mealSummary.get("idMeal").asText();
                Recipe fullRecipe = getMealById(id); // fetch full recipe details
                if (fullRecipe != null) {
                    recipes.add(fullRecipe);
                }
            }
        }

        return recipes;
    }

    public Recipe getMealById(String id) throws Exception {
        Thread.sleep(50);
        String response = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/lookup.php").queryParam("i", id).build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return parseRecipeFromJson(response);
    }

    // Parse JSON string into Recipe object
    private Recipe parseRecipeFromJson(String json) throws Exception {
        JsonNode root = mapper.readTree(json);
        JsonNode mealNode = root.get("meals").get(0);

        Recipe recipe = new Recipe();
        recipe.setIdMeal(mealNode.get("idMeal").asText());
        recipe.setName(mealNode.get("strMeal").asText());
        recipe.setCategory(mealNode.get("strCategory").asText());
        recipe.setArea(mealNode.get("strArea").asText());
        recipe.setInstructions(mealNode.get("strInstructions").asText());
        recipe.setThumbnail(mealNode.get("strMealThumb").asText());
        recipe.setTags(mealNode.get("strTags").asText(null));
        recipe.setYoutube(mealNode.get("strYoutube").asText(null));

        Map<String, String> ingredients = new HashMap<>();
        for (int i = 1; i <= 20; i++) {
            String ing = mealNode.get("strIngredient" + i).asText();
            String measure = mealNode.get("strMeasure" + i).asText();
            if (ing != null && !ing.isBlank()) {
                ingredients.put(ing, measure != null ? measure : "");
            }
        }
        recipe.setIngredients(ingredients);

        return recipe;
    }
}
