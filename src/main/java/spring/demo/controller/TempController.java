//This controller serves as updating data wherever malformed to the database

package spring.demo.controller;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import spring.demo.config.security.JwtService;
import spring.demo.models.Ingredient;
import spring.demo.models.Recipe;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;
import spring.demo.service.MealService;
import spring.demo.service.NutritionService;
import spring.demo.service.PriceService;

import java.util.*;

public class TempController{

private NutritionService nutritionService;
private RecipeRepository recipeRepository;
private static final Logger log = LoggerFactory.getLogger(MainController.class);



@Autowired
public TempController( NutritionService nutritionService,
                       RecipeRepository recipeRepository) {
    super();
    this.nutritionService = nutritionService;
    this.recipeRepository = recipeRepository;
}

public void updateAllRecipeCalories() throws Exception {
    // Find all recipes with null or zero calories
    List<Recipe> recipesWithMissingCalories = recipeRepository.findRecipesWithNullOrZeroCalories();

    System.out.println("Found " + recipesWithMissingCalories.size() + " recipes with missing calorie data");

    int successCount = 0;
    int errorCount = 0;

    for (Recipe recipe : recipesWithMissingCalories) {
        try {
            System.out.println("Updating calories for: " + recipe.getName());

            // Fetch nutritional data from 3rd party API
            nutritionService.searchMeal(recipe.getName(), recipe);

            // Save the updated recipe
            if(recipe.getCalories() != 0)
                recipeRepository.save(recipe);
            else continue;

            successCount++;
            System.out.println("Successfully updated calories for: " + recipe.getName() +
                    " (Calories: " + recipe.getCalories() + ")");

            // Optional: Add small delay to avoid rate limiting
            Thread.sleep(100);

        } catch (Exception e) {
            errorCount++;
            System.err.println("Error updating calories for " + recipe.getName() + ": " + e.getMessage());
            // Continue with next recipe
        }
    }

    System.out.println("\n=== Calorie Update Complete ===");
    System.out.println("Successfully updated: " + successCount + " recipes");
    System.out.println("Errors/Skipped: " + errorCount + " recipes");
}

@PostMapping("/admin/update-calories")
public ResponseEntity<Map<String, Object>> updateRecipeCalories(@AuthenticationPrincipal UserDetails userDetails) {
    try {
        updateAllRecipeCalories();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Recipe calorie values have been updated successfully");

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "error");
        errorResponse.put("message", "Error updating calorie values: " + e.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

public void updateAllRecipeMealCosts() throws Exception {
    // Find all recipes with null or zero meal cost
    List<Recipe> recipesWithMissingCost = recipeRepository.findRecipesWithNullOrZeroMealCost();

    System.out.println("Found " + recipesWithMissingCost.size() + " recipes with missing meal cost data");

    int successCount = 0;
    int errorCount = 0;

    for (Recipe recipe : recipesWithMissingCost) {
        try {
            System.out.println("Updating meal cost for: " + recipe.getName());

            // Call getMealCost which updates the mealCost in place
            //double calculatedCost = getMealCost(recipe);

            // Save the updated recipe
            if(recipe.getMealCost() != null && recipe.getMealCost() > 0.0)
                recipeRepository.save(recipe);

            successCount++;
            System.out.println("Successfully updated meal cost for: " + recipe.getName() +
                    " (Cost: $" + String.format("%.2f", recipe.getMealCost()) + ")");

            // Optional: Add small delay if needed
            Thread.sleep(1500);

        } catch (Exception e) {
            errorCount++;
            System.err.println("Error updating meal cost for " + recipe.getName() + ": " + e.getMessage());
            // Continue with next recipe
        }
    }

    System.out.println("\n=== Meal Cost Update Complete ===");
    System.out.println("Successfully updated: " + successCount + " recipes");
    System.out.println("Errors/Skipped: " + errorCount + " recipes");
}

@PostMapping("/admin/update-meal-costs")
public ResponseEntity<Map<String, Object>> updateRecipeMealCosts(
        @AuthenticationPrincipal UserDetails userDetails) {

    try {
        System.out.println("User " + userDetails.getUsername() + " triggered meal cost update");

        updateAllRecipeMealCosts();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Recipe meal cost values have been updated successfully");
        response.put("updatedBy", userDetails.getUsername());

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "error");
        errorResponse.put("message", "Error updating meal cost values: " + e.getMessage());
        errorResponse.put("user", userDetails.getUsername());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

    @PostMapping("/admin/import-calories-text")
    @Transactional
    public ResponseEntity<?> importCaloriesFromText(@RequestBody String csvText) {

        if (csvText == null || csvText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No CSV text provided"));
        }

        log.info("Received CSV text, length: {} characters", csvText.length());

        try {
            String[] lines = csvText.split("\\r?\\n");
            log.info("Total lines: {}", lines.length);

            int updated = 0;
            int notFound = 0;
            int skipped = 0;
            List<String> notFoundNames = new ArrayList<>();

            // Skip header (first line)
            for (int i = 1; i < lines.length; i++) {
                String line = lines[i].trim();

                if (line.isEmpty()) {
                    continue;
                }

                try {
                    // Remove all quotes first, then split by comma
                    line = line.replace("\"", "");
                    String[] parts = line.split(",");

                    if (parts.length < 2) {
                        log.warn("Line {}: Not enough fields - only {} parts", i + 1, parts.length);
                        skipped++;
                        continue;
                    }

                    String name = parts[0].trim();
                    String caloriesStr = parts[1].trim();

                    // Parse calories
                    int calories;
                    try {
                        calories = Integer.parseInt(caloriesStr);
                        if (calories == 0) {
                            log.debug("Skipping {} - calories is 0", name);
                            skipped++;
                            continue;
                        }
                    } catch (NumberFormatException e) {
                        log.warn("Line {}: Invalid calories '{}' for '{}'", i + 1, caloriesStr, name);
                        skipped++;
                        continue;
                    }

                    // Find and update recipe
                    Optional<Recipe> recipeOpt = recipeRepository.findByNameIgnoreCase(name);

                    if (recipeOpt.isPresent()) {
                        Recipe recipe = recipeOpt.get();
                        int oldCalories = recipe.getCalories();
                        recipe.setCalories(calories);
                        recipeRepository.save(recipe);
                        updated++;
                        log.info("Updated '{}': {} -> {} calories", name, oldCalories, calories);
                    } else {
                        notFound++;
                        notFoundNames.add(name);
                        log.warn("Recipe not found: '{}'", name);
                    }

                } catch (Exception e) {
                    log.error("Error processing line {}: {}", i + 1, e.getMessage());
                    skipped++;
                }
            }

            log.info("Import complete: {} updated, {} not found, {} skipped", updated, notFound, skipped);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("updated", updated);
            response.put("notFound", notFound);
            response.put("skipped", skipped);
            response.put("totalLines", lines.length - 1);
            response.put("notFoundRecipes", notFoundNames.size() > 20 ?
                    notFoundNames.subList(0, 20) : notFoundNames);
            response.put("message", String.format("Successfully updated %d recipes. %d not found, %d skipped.",
                    updated, notFound, skipped));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error importing CSV text", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
