package spring.demo.service;

import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import spring.demo.config.security.JwtService;
import spring.demo.controller.MainController;
import spring.demo.models.*;
import spring.demo.models.repository.IngredientRepository;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MealPlanService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private MealService mealService;
    private NutritionService nutritionService;
    private PriceService priceService;
    private IngredientRepository ingredientRepository;
    private RecipeRepository recipeRepository;
    private static final Logger log = LoggerFactory.getLogger(MealPlanService.class);


    private ArrayList<Recipe> recipieList = new ArrayList<Recipe>();
    private ArrayList<Ingredient> priceList = new ArrayList<Ingredient>();


    @Autowired
    public MealPlanService(UserRepository userRepository, JwtService jwtService, AuthenticationManager authenticationManager,
                          MealService mealService, NutritionService nutritionService,
                          PriceService priceService, IngredientRepository ingredientRepository, RecipeRepository recipeRepository) {
        super();
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.mealService = mealService;
        this.nutritionService = nutritionService;
        this.priceService = priceService;
        this.ingredientRepository = ingredientRepository;
        this.recipeRepository = recipeRepository;
    }

    //Main algorithm: This loads and filtered recipes by several categories, filters them by cost, price and ingredeints, returning a final list
    public ArrayList<Recipe> loadandFilterRecipies(@NotNull User user) throws Exception {

        //Load recipes by category from the DB
        List<String> categories = Arrays.asList("Chicken", "Beef", "Seafood", "Vegetarian", "Breakfast", "Vegan", "Goat", "Lamb", "Pork", "Breakfast");
        recipieList = (ArrayList<Recipe>) categories.stream()
                .flatMap(category -> {
                    try {
                        return recipeRepository.findByCategory(category).stream();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .distinct() // Remove duplicates based on equals/hashCode
                .collect(Collectors.toList());


        //Filter in 3 steps and return final list
        recipieList = filterByCommonIngredientsOptimized(recipieList, 2);
        recipieList = filterByCalories(recipieList, user);
        recipieList = filterByPrice(recipieList, user);
        return recipieList;
    }

    private ArrayList<Recipe> filterByPrice(ArrayList<Recipe> recipieList, User user) throws Exception {
        ArrayList<Recipe> filtered = new ArrayList<>();
        // Removes a recipe if the price, based on serving size costs too much
        double costMax = user.getPreferences().getBudget() / (user.getPreferences().getMeals() * 7) + 1.2;

        for (Recipe recipe : recipieList) {
            if (getMealCost(recipe) < costMax) {
                filtered.add(recipe);
            }
        }
        return filtered;
    }

    private double getMealCost(Recipe recipe) throws Exception {
        double mealCost = 0.0;
        Set<String> processedIngredients = new HashSet<>();

        for (Map.Entry<String, String> entry : recipe.getIngredients().entrySet()) {
            String ingName = entry.getKey();
            String usedAmount = entry.getValue();
            String query = ingName.trim().toLowerCase();

            // Skip duplicates
            if (processedIngredients.contains(query)) {
                log.info("Already processed: {} - skipping duplicate", ingName);
                continue;
            }

            // Get ingredient from cache, DB, or API
            Optional<Ingredient> ingredient = getOrFetchIngredient(ingName, query);

            if (ingredient.isPresent()) {
                // Calculate cost for this ingredient
                double ingredientCost = calculateIngredientCost(ingredient.get(), ingName, usedAmount, recipe);

                if (ingredientCost >= 0) {
                    mealCost += ingredientCost;
                    processedIngredients.add(query);
                    log.info("Added ${} for {} | Running total: ${}", ingredientCost, ingName, mealCost);
                }
            }
        }

        recipe.setMealCost(mealCost);
        return mealCost;
    }

    // Get ingredient from local cache, DB, or fetch from API
    private Optional<Ingredient> getOrFetchIngredient(String ingName, String query) {
        // Check local cache first
        Optional<Ingredient> local = priceList.stream()
                .filter(i -> i != null && i.getName() != null)
                .filter(i -> i.getName().trim().toLowerCase().equals(query))
                .findFirst();

        if (local.isPresent()) {
            log.info("Already found locally: {}", ingName);
            return local;
        }

        // Check database
        Optional<Ingredient> dbIngredient = ingredientRepository.findByNameIgnoreCase(query);

        if (dbIngredient.isPresent()) {
            return handleDatabaseIngredient(dbIngredient.get(), ingName, query);
        }

        // Fetch from API as last resort
        return fetchNewIngredient(ingName, query);
    }

    // Handle ingredient found in database (check cache validity)
    private Optional<Ingredient> handleDatabaseIngredient(Ingredient dbIng, String ingName, String query) {
        log.info("Found in DB: {}", ingName);
        log.info("Cache valid? {}", dbIng.isCacheValid());

        if (dbIng.isCacheValid()) {
            priceList.add(dbIng);
            return Optional.of(dbIng);
        }

        // Cache expired - refresh from API
        return refreshIngredientFromAPI(dbIng, ingName, query);
    }

    // Refresh expired ingredient from API
    private Optional<Ingredient> refreshIngredientFromAPI(Ingredient dbIng, String ingName, String query) {
        try {
            Ingredient fresh = priceService.getIngredient(ingName);
            if (fresh != null) {
                fresh.setId(dbIng.getId());
                fresh.setName(query);

                priceList.add(fresh);
                ingredientRepository.save(fresh);
                ingredientRepository.flush();

                log.info("Refreshed DB ingredient: {}", ingName);
                return Optional.of(fresh);
            }
        } catch (Exception e) {
            log.error("Error refreshing ingredient: {}", ingName, e);
        }
        return Optional.empty();
    }

    // Fetch new ingredient from API
    private Optional<Ingredient> fetchNewIngredient(String ingName, String query) {
        try {
            Ingredient fresh = priceService.getIngredient(ingName);
            if (fresh != null) {
                fresh.setName(query);

                priceList.add(fresh);
                ingredientRepository.save(fresh);
                ingredientRepository.flush();

                log.info("Fetched NEW ingredient and saved: {}", ingName);
                return Optional.of(fresh);
            } else {
                log.warn("Could not fetch ingredient from API: {}", ingName);
            }
        } catch (Exception e) {
            log.error("Error fetching ingredient: {}", ingName, e);
        }
        return Optional.empty();
    }

    // Calculate cost for a single ingredient
    private double calculateIngredientCost(Ingredient ingredient, String ingName, String usedAmount, Recipe recipe) {
        // Parse amounts
        double recipeAmount = parseRecipeAmount(usedAmount, recipe);
        double packageAmount = parsePackageAmount(ingredient.getServingsPerContainer(), recipe, usedAmount);

        log.info("Ingredient: {} | Recipe needs: {} {} | Package size: {} | Package price: ${}",
                ingName, recipeAmount, getUnitType(usedAmount), packageAmount, ingredient.getTotalPrice());

        if (packageAmount <= 0) {
            log.warn("Could not calculate cost for {} - packageAmount is 0", ingName);
            return -1;
        }

        // Check for unit mismatch
        if (hasUnitMismatch(usedAmount, ingredient.getServingsPerContainer(), packageAmount)) {
            return handleUnitMismatch(ingredient, ingName, usedAmount);
        }

        // Calculate normal cost
        return calculateNormalCost(ingredient, ingName, recipeAmount, packageAmount);
    }

    // Parse recipe amount based on unit type
    private double parseRecipeAmount(String usedAmount, Recipe recipe) {
        if (usedAmount.endsWith("g") || usedAmount.endsWith("kg")) {
            return recipe.parseToGrams(usedAmount);
        } else if (usedAmount.endsWith("ml") || usedAmount.endsWith("l")) {
            return recipe.parseToMilliliters(usedAmount);
        } else if (usedAmount.endsWith("tsb") || usedAmount.endsWith("tbs") || usedAmount.endsWith("tblsp")) {
            return recipe.parseToTeaspoons(usedAmount);
        } else {
            // Handle count-based measurements
            Matcher m = Pattern.compile("(\\d+\\.?\\d*)").matcher(usedAmount);
            if (m.find()) {
                return Double.parseDouble(m.group(1));
            }
        }
        return 0;
    }

    // Parse package amount based on unit type
    private double parsePackageAmount(String servingsPerContainer, Recipe recipe, String usedAmount) {
        if (usedAmount.endsWith("g") || usedAmount.endsWith("kg")) {
            return recipe.parseToGrams(servingsPerContainer);
        } else if (usedAmount.endsWith("ml") || usedAmount.endsWith("l")) {
            return recipe.parseToMilliliters(servingsPerContainer);
        } else if (usedAmount.endsWith("tsb") || usedAmount.endsWith("tbs") || usedAmount.endsWith("tblsp")) {
            return recipe.parseToTeaspoons(servingsPerContainer);
        } else {
            // Handle count-based measurements
            Matcher m = Pattern.compile("(\\d+\\.?\\d*)").matcher(servingsPerContainer);
            if (m.find()) {
                return Double.parseDouble(m.group(1));
            }
        }
        return 0;
    }

    // Check if recipe and package units don't match
    private boolean hasUnitMismatch(String usedAmount, String servingsPerContainer, double packageAmount) {
        boolean recipeIsWeight = usedAmount.contains("g") || usedAmount.contains("kg") ||
                usedAmount.contains("ml") || usedAmount.contains("l");

        boolean packageIsWeight = servingsPerContainer.contains("g") ||
                servingsPerContainer.contains("kg") ||
                servingsPerContainer.contains("ml") ||
                servingsPerContainer.contains("l") ||
                servingsPerContainer.contains("oz") ||
                servingsPerContainer.contains("lb");

        return recipeIsWeight && !packageIsWeight && packageAmount < 100;
    }

    // Handle unit mismatch by using package estimate
    private double handleUnitMismatch(Ingredient ingredient, String ingName, String usedAmount) {
        log.warn("UNIT MISMATCH for {}: Recipe needs weight/volume ({}) but package is count ({})",
                ingName, usedAmount, ingredient.getServingsPerContainer());
        log.warn("Using package price as rough estimate instead of calculation");

        double estimatedCost = ingredient.getTotalPrice();

        if (estimatedCost > 20.0) {
            log.error("REJECTED - Even package estimate too high: ${}", estimatedCost);
            return -1;
        }

        log.info("Added ${} (package estimate) for {}", estimatedCost, ingName);
        return estimatedCost;
    }

    // Calculate normal cost when units match
    private double calculateNormalCost(Ingredient ingredient, String ingName, double recipeAmount, double packageAmount) {
        double unitCost = ingredient.getTotalPrice() / packageAmount;
        double ingredientCost = unitCost * recipeAmount;

        // Sanity check for unreasonable cost
        if (ingredientCost > 50.0) {
            log.error("REJECTED - Unreasonable cost for {}: ${} (unitCost: ${}, recipeAmount: {}, packageAmount: {})",
                    ingName, ingredientCost, unitCost, recipeAmount, packageAmount);
            log.error("Package price was: ${}, possible unit mismatch or bulk item", ingredient.getTotalPrice());
            return -1;
        }

        // Warning for high unit cost
        if (unitCost > 10.0) {
            log.warn("HIGH unit cost for {}: ${} per unit - verify package size parsing", ingName, unitCost);
        }

        return ingredientCost;
    }

    // Helper method to determine unit type for logging
    private String getUnitType(String amount) {
        if (amount.contains("g") || amount.contains("kg")) return "grams";
        if (amount.contains("ml") || amount.contains("l") || amount.contains("fl oz")) return "ml";
        if (amount.contains("tsp") || amount.contains("tbsp")) return "tsp";
        return "count";
    }


    /*
    @param: recipe to be used to calculate serving size
    This function takes the main protein source of a meal, based on weight determines its serving size assuming an adults avg protein intake
    It adds servings based on weight of other spices and ingredients
     */
    public int getServingSize(Recipe recipe) {
        int proteinWeight = recipe.extract_weight("Chicken");
        if (proteinWeight == 0) {
            proteinWeight = recipe.extract_weight("Beef");
        }

        double cookedWeight = proteinWeight * 0.78; //looses weight as cooked
        double servings_protein = Math.toIntExact(Math.round(cookedWeight / 135));

        double bulk_weight = recipe.sumWeight() - proteinWeight; //minus weight, we already stored
        if (bulk_weight >= 400)
            servings_protein += 1;
        else if (bulk_weight >= 200)
            servings_protein += 0.5;

        return Math.toIntExact(Math.round(servings_protein));
    }

    private ArrayList<Recipe> filterByCalories(List<Recipe> recipes, User user) {
        double max = (double) user.getPreferences().getCalories() / user.getPreferences().getMeals();
        ArrayList<Recipe> filtered = new ArrayList<>();

        //For revery recipe, determine the calorie count, and filter out if too high
        for (Recipe recipe : recipes) {
            // If calories are not set, attempt to fetch them.

            if (recipe.getCalories() <= max || recipe.getCalories() == 0) {
                filtered.add(recipe);
            } else {
                log.info("Filtering out {} due to high calorie count: {}", recipe.getName(), recipe.getCalories());
            }
        }
        return filtered;
    }


    public ArrayList<Recipe> filterByCommonIngredientsOptimized(List<Recipe> recipes, int minShared) {
        // Map each ingredient to the set of recipes that contain it
        Map<String, Set<Recipe>> ingredientMap = new HashMap<>();

        for (Recipe recipe : recipes) {
            for (String ingredient : recipe.getIngredients().keySet()) {
                ingredientMap.computeIfAbsent(ingredient, k -> new HashSet<>()).add(recipe);
            }
        }

        // Count how many shared ingredients each recipe has with others
        Map<Recipe, Integer> sharedCount = new HashMap<>();

        for (Recipe recipe : recipes) {
            Set<Recipe> neighbors = new HashSet<>();

            for (String ingredient : recipe.getIngredients().keySet()) {
                neighbors.addAll(ingredientMap.getOrDefault(ingredient, Collections.emptySet()));
            }

            // Remove self
            neighbors.remove(recipe);

            // Count number of common ingredients with any neighbor
            int maxCommon = 0;
            for (Recipe neighbor : neighbors) {
                Set<String> common = new HashSet<>(recipe.getIngredients().keySet());
                common.retainAll(neighbor.getIngredients().keySet());
                maxCommon = Math.max(maxCommon, common.size());
            }

            sharedCount.put(recipe, maxCommon);
        }

        // Keep only recipes with at least minShared common ingredients
        List<Recipe> filtered = new ArrayList<>();
        for (Map.Entry<Recipe, Integer> entry : sharedCount.entrySet()) {
            if (entry.getValue() >= minShared) {
                filtered.add(entry.getKey());
            }
        }

        return (ArrayList<Recipe>) filtered;
    }

    //Find all user meals and generate new recipe list based off requirements
    public List<Recipe> generateSubRecipeList(int req, int calorie, List<UserMealPlan> existingPlan, List<Recipe> alreadySelected) {
        // FIXED: Find all meals from existingPlan that are NOT planned and NOT eaten
        // These are the "available" recipes the user has tried before but can reuse
        List<Recipe> allMeals = existingPlan.stream()
                .filter(Objects::nonNull)
                .filter(plan -> plan.getRecipe() != null)
                .filter(plan -> !plan.isPlanned()) // Don't reuse currently planned meals
                .filter(plan -> !plan.isEaten())   // Don't reuse recently eaten meals
                .map(UserMealPlan::getRecipe)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Recipe> list = new ArrayList<>(alreadySelected);
        int min = calorie / req;
        int needed = req - list.size();

        log.info("Generating meal plan: need {}, have {}, available from history: {}",
                req, list.size(), allMeals.size());

        // Layer 1: Find recipes from user's meal history (not currently planned or eaten)
        if (allMeals != null && !allMeals.isEmpty()) {
            for (Recipe recipe : allMeals) {
                if (list.size() >= req) break;
                if (list.contains(recipe)) continue;

                if (recipe.getCalories() >= min - 120 && recipe.getCalories() <= min + 120) {
                    list.add(recipe);
                    log.info("Added from history: {}", recipe.getName());
                }
            }
        }

        // Layer 2: Find recipes from local recipe list
        if (list.size() < req && recipieList != null) {
            for (Recipe recipe : recipieList) {
                if (list.size() >= req) break;

                if (!list.contains(recipe) &&
                        recipe.getCalories() >= min - 120 &&
                        recipe.getCalories() <= min + 120) {
                    list.add(recipe);
                    log.info("Added from local list: {}", recipe.getName());
                }
            }
        }

        if (list.size() < req) {
            List<Recipe> dbRecipes = recipeRepository.findByCaloriesBetween(min - 120, min + 120);
            for (Recipe recipe : dbRecipes) {
                if (list.size() >= req) break;
                if (!list.contains(recipe)) {
                    list.add(recipe);

                }
            }
        }

        int totalCalories = list.stream().mapToInt(Recipe::getCalories).sum();
        //If we are still under our requirements, add a small meal/snack  to fill the diet
        if (totalCalories < calorie) {
            int gap = calorie - totalCalories;

            // Try existing plan first
            Recipe closestRecipe = null;
            if (existingPlan != null) {
                closestRecipe = allMeals.stream()
                        .filter(r -> !list.contains(r))
                        .min(Comparator.comparingInt(r -> Math.abs(r.getCalories() - gap)))
                        .orElse(null);
            }

            if (closestRecipe == null && recipieList != null) {
                closestRecipe = recipieList.stream()
                        .filter(r -> !list.contains(r))
                        .min(Comparator.comparingInt(r -> Math.abs(r.getCalories() - gap)))
                        .orElse(null);
            }

            if (closestRecipe == null) {
                closestRecipe = recipeRepository.findClosestToCalorieTarget(gap, 0, Integer.MAX_VALUE);
            }

            if (closestRecipe != null && !list.contains(closestRecipe)) {
                list.add(closestRecipe);

            }
        }

        return list;
    }

    public List<Recipe> selectMeals(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        int req = user.getPreferences().getMeals();
        int calorie = user.getPreferences().getCalories();
        List<Recipe> subList = new ArrayList<>();

        List<UserMealPlan> existingPlan = user.getMealPlans() != null
                ? new ArrayList<>(user.getMealPlans())
                : new ArrayList<>();

        if (!existingPlan.isEmpty()) {
            List<UserMealPlan> plannedMeals = existingPlan.stream()
                    .filter(UserMealPlan::isPlanned)
                    .collect(Collectors.toList());

            log.info("User has {} meals marked as planned", plannedMeals.size());
            plannedMeals.forEach(mp ->
                    log.info("  - {} (ID: {}, Eaten: {}, Planned: {})",
                            mp.getRecipe() != null ? mp.getRecipe().getName() : "null",
                            mp.getId(),
                            mp.isEaten(),
                            mp.isPlanned())
            );


            subList = plannedMeals.stream()
                    .map(UserMealPlan::getRecipe)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (subList.isEmpty()) {
                subList = recipeRepository.findMarkedRecipesByUserId(user.getId());
                log.info("Sub list size after db: {}", subList.size());
            }

            // Check if all planned meals are eaten
            boolean allPlannedMealsEaten = !plannedMeals.isEmpty() &&
                    plannedMeals.stream().allMatch(UserMealPlan::isEaten);

            if (allPlannedMealsEaten) {
                log.info("All planned meals eaten. Unmarking and generating new plan...");

                // Unmark old planned meals
                plannedMeals.forEach(mealPlan -> mealPlan.setPlanned(false));

                // Clear the old subList
                subList.clear();

                // Generate NEW meal plan
                subList = generateSubRecipeList(req, calorie, existingPlan, new ArrayList<>());

                // Continue to save the new meals below

            } else if (subList.size() == req || subList.size() == req + 1) {
                // Return existing planned meals (not all eaten yet)
                log.info("Returning {} existing planned meals", subList.size());
                return subList;
            }
        }

        // Build new meal plan if we don't have enough
        if (subList.size() < req) {
            log.info("Need more meals. Generating {} meals...", req - subList.size());
            subList = generateSubRecipeList(req, calorie, existingPlan, subList);
        }

        // Save new planned meals
        for (Recipe recipe : subList) {
            if (recipe != null) {
                // Check if this recipe is already in the plan as planned
                boolean alreadyExists = existingPlan.stream()
                        .filter(mp -> mp != null)
                        .filter(mp -> mp.getRecipe() != null)
                        .filter(UserMealPlan::isPlanned)
                        .anyMatch(mp -> mp.getRecipe().getId() == recipe.getId());

                if (!alreadyExists) {
                    UserMealPlan mealPlan = new UserMealPlan();
                    mealPlan.setRecipe(recipe);
                    mealPlan.setPlanned(true);
                    mealPlan.setEaten(false);
                    mealPlan.setUser(user);
                    existingPlan.add(mealPlan);
                    log.info("Adding new planned meal: {}", recipe.getName());
                }
            }
        }

        removeDuplicates(user, existingPlan);

        // Update user's meal plans
        user.setMealPlans(existingPlan);
        userRepository.save(user);

        // CRITICAL FIX: Rebuild subList from ONLY the planned meals in existingPlan
        subList = existingPlan.stream()
                .filter(UserMealPlan::isPlanned)
                .filter(mp -> !mp.isEaten()) // Only return meals that aren't eaten yet
                .map(UserMealPlan::getRecipe)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        log.info("Returning {} NEW planned meals to frontend: {}",
                subList.size(),
                subList.stream().map(Recipe::getName).collect(Collectors.joining(", ")));

        return (subList);
    }

    public void findAndSaveMealPlan(User user) {
        for (Recipe recipe : recipieList) {
            // Add to meal plan
            Recipe managedRecipe = recipeRepository.findByNameIgnoreCase(recipe.getName())
                    .orElseThrow(() -> new RuntimeException("Recipe not found: " + recipe.getName()));

            UserMealPlan mealPlan = new UserMealPlan(user, managedRecipe);
            user.getMealPlans().add(mealPlan);

            // Save user groceryList(ingridients) based on existing recipes ingredients
            recipe.getIngredients().keySet().forEach(ingredientName -> {
                priceList.stream()
                        .filter(ing -> ing.getName().equalsIgnoreCase(ingredientName))
                        .findFirst()
                        .ifPresent(ingredient -> {
                            UserIngredient userIngredient = new UserIngredient(user, ingredient);
                            user.getGroceryList().add(userIngredient);
                        });
            });
        }
    }

    public void removeDuplicates(User user, List<UserMealPlan> existingPlan) {
        Set<Long> existingPlanRecipeIds = existingPlan.stream()
                .filter(Objects::nonNull) // Check meal plan is not null
                .filter(plan -> plan.getRecipe() != null) // Check recipe is not null
                .map(plan -> plan.getRecipe().getId())
                .collect(Collectors.toSet());

        user.getMealPlans().removeIf(plan ->
                plan != null && // Check plan is not null
                        plan.getRecipe() != null && // Check recipe is not null
                        existingPlanRecipeIds.contains(plan.getRecipe().getId()) &&
                        !plan.isPlanned()
        );
    }
}
