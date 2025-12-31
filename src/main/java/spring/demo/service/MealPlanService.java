/*
This services provides a list of methods to use regarding meal and ingredient data regarding a user,
aimed at designing a new meal plan, calculating meals and etc
 */

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
import spring.demo.models.*;
import spring.demo.models.repository.IngredientRepository;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;

import java.lang.reflect.Array;
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
    public ArrayList<Recipe> loadandFilterRecipies(@NotNull User user, ArrayList<Recipe> recipieList, ArrayList<Ingredient> priceList) throws Exception {

        //Load recipes by category from the DB
        List<String> categories = Arrays.asList("Chicken", "Beef", "Pork", "Vegetarian", "Vegan", "Breakfast");
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
        recipieList = filterByCommonIngredientsOptimized(recipieList, 4);
        recipieList = filterByCalories(recipieList, user);
        recipieList = filterByPrice(recipieList, user, priceList);
        return recipieList;
    }

    private ArrayList<Recipe> filterByPrice(ArrayList<Recipe> recipieList, User user, ArrayList<Ingredient> priceList) throws Exception {
        ArrayList<Recipe> filtered = new ArrayList<>();
        // Removes a recipe if the price, based on serving size costs too much
        double costMax = user.getPreferences().getBudget() / (user.getPreferences().getMeals() * 7) + 1.2;

        for (Recipe recipe : recipieList) {
            if (getMealCost(recipe, priceList) < costMax) {
                filtered.add(recipe);
            }
        }
        return filtered;
    }

    //returns a meal cost of a function by calcualting ingredient cost
    private double getMealCost(Recipe recipe, ArrayList<Ingredient> priceList) throws Exception {
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
            Optional<Ingredient> ingredient = getOrFetchIngredient(ingName, query, priceList);

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
    private Optional<Ingredient> getOrFetchIngredient(String ingName, String query, ArrayList<Ingredient> priceList) {
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
            return handleDatabaseIngredient(dbIngredient.get(), ingName, query, priceList);
        }

        // Fetch from API as last resort
        return fetchNewIngredient(ingName, query, priceList);
    }

    // Handle ingredient found in database (check cache validity)
    private Optional<Ingredient> handleDatabaseIngredient(Ingredient dbIng, String ingName, String query, ArrayList<Ingredient> priceList) {
        log.info("Found in DB: {}", ingName);
        log.info("Cache valid? {}", dbIng.isCacheValid());

        if (dbIng.isCacheValid()) {
            priceList.add(dbIng);
            return Optional.of(dbIng);
        }

        // Cache expired - refresh from db
        return refreshIngredientFromAPI(dbIng, ingName, query, priceList);
    }

    // Refresh expired ingredient from db
    private Optional<Ingredient> refreshIngredientFromAPI(Ingredient dbIng, String ingName, String query, ArrayList<Ingredient> priceList) {
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

    // Fetch new ingredient from db
    private Optional<Ingredient> fetchNewIngredient(String ingName, String query, ArrayList<Ingredient> priceList) {
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
    public String getUnitType(String amount) {
        String lower = amount.toLowerCase().trim();

        if (lower.endsWith("g") || lower.endsWith("kg") || lower.contains(" g") || lower.contains(" kg")) {
            return "grams";
        }

        if (lower.endsWith("ml") || lower.endsWith("l") || lower.contains("fl oz")) {
            return "ml";
        }

        if (lower.endsWith("tsp") || lower.endsWith("tbsp") || lower.contains(" tsp") || lower.contains(" tbsp")) {
            return "tsp";
        }

        return "count";
    }


    //unused for now
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

    //Filters recipes based on min shared
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

    //Find all user meals and generate new recipe list based off requirements of calories and existing recipes
    public List<Recipe> generateSubRecipeList(int req, int calorie, List<UserMealPlan> existingPlan, List<Recipe> alreadySelected, ArrayList<Recipe> recipieList) {
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


        if (!allMeals.isEmpty()) {
            //fetch meals in plan, in memory or db
            fetchAllMeals(allMeals, list, req, min, recipieList);
        }

        int totalCalories = list.stream().mapToInt(Recipe::getCalories).sum();
        //If we are still under our requirements, add a small meal/snack  to fill the diet
        int gap = calorie - totalCalories;
        if (gap > 200) {

            // Try to find a recipe to fill the calorie gap in memory or from list
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

    private List<Recipe> fetchAllMeals(List<Recipe> allMeals, List<Recipe> list, int req, int min, ArrayList<Recipe> recipieList) {
        for (Recipe recipe : allMeals) {
            if (list.size() >= req) break;
            if (list.contains(recipe)) continue;

            if (recipe.getCalories() >= min - 120 && recipe.getCalories() <= min + 120) {
                list.add(recipe);
                log.info("Added from history: {}", recipe.getName());
            }
        }


        //secondary fetch in-memory to find recipes
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
        return list;
    }


    //Selects a required amount of meals for the user's new meal plan of the day, opts out for early returns where able
    public List<Recipe> selectMeals(@AuthenticationPrincipal UserDetails userDetails, ArrayList<Recipe> recipeList) {
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

            //secondary fetch to get meals marked as planned
            if (subList.isEmpty()) {
                subList = recipeRepository.findMarkedRecipesByUserId(user.getId());
                log.info("Sub list size after db: {}", subList.size());
            }

            // Check if all planned meals are eaten
            boolean allPlannedMealsEaten = !plannedMeals.isEmpty() &&
                    plannedMeals.stream().allMatch(UserMealPlan::isEaten);

            if (allPlannedMealsEaten) {
                log.info("All planned meals eaten. Unmarking and generating new plan...");

                updateUserPlan(existingPlan, plannedMeals);

                user.setMealPlans(existingPlan);
                userRepository.save(user);
                log.info("Saved user with unmarked meal plans");

                subList.clear();
                existingPlan = new ArrayList<>(user.getMealPlans());

                subList = generateSubRecipeList(req, calorie, existingPlan, subList, recipeList);


            } else if (subList.size() == req || subList.size() == req + 1) {
                // Return existing planned meals (not all eaten yet)
                log.info("Returning {} existing planned meals", subList.size());
                return subList;
            }
        }

        // Build new meal plan if we don't have enough
        if (subList.size() < req) {
            log.info("Need more meals. Generating {} meals...", req - subList.size());
            subList = generateSubRecipeList(req, calorie, existingPlan, subList, recipeList);
        }

        subList = savePlannedMeals(subList, existingPlan, user);
        return (subList);
    }

    // Find and update the matching UserMealPlans in existingPlan with new meals marked
    private void updateUserPlan(List<UserMealPlan> existingPlan, List<UserMealPlan> plannedMeals) {
        Set<Long> plannedRecipeIds = plannedMeals.stream()
                .map(UserMealPlan::getRecipe)
                .filter(Objects::nonNull)
                .map(Recipe::getId)
                .collect(Collectors.toSet());

        existingPlan.stream()
                .filter(mp -> mp.getRecipe() != null)
                .filter(mp -> plannedRecipeIds.contains(mp.getRecipe().getId()))
                .forEach(mp -> {
                    mp.setPlanned(false);
                    mp.setEaten(true);
                    log.info("Unmarked meal plan for recipe: {}", mp.getRecipe().getName());
                });

    }
    //saves a list of planned meals and modifies it
    private List<Recipe> savePlannedMeals(List<Recipe> subList, List<UserMealPlan> existingPlan, User user) {
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

        subList = existingPlan.stream()
                .filter(UserMealPlan::isPlanned)
                .filter(mp -> !mp.isEaten()) // Only return meals that aren't eaten yet
                .map(UserMealPlan::getRecipe)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return subList;
    }

    //Finds and save's recipe meal plans
    public void findAndSaveMealPlan(User user, ArrayList<Recipe> recipieList, ArrayList<Ingredient> priceList) {
        // Get existing ingredient names in grocery list to avoid duplicates
        Set<String> existingIngredientNames = user.getGroceryList().stream()
                .map(ui -> ui.getIngredient().getName().toLowerCase())
                .collect(Collectors.toSet());

        List<String> commonItems = Arrays.asList("salt", "pepper", "water", "sugar", "oil",
                "olive oil", "flour", "rice", "baking powder", "soy sauce", "vinegar", "cumin",
                "butter", "parsley", "garlic", "onion powder", "paprika",
                "black pepper", "kosher salt", "ketchup", "sauce", "sake", "null", "honey", "paneer", "powder", "spice");

        for (Recipe recipe : recipieList) {
            // Add to meal plan
            UserMealPlan mealPlan = new UserMealPlan(user, recipe);
            user.getMealPlans().add(mealPlan);

            recipe.getIngredients().keySet().forEach(ingredientName -> {
                String lowerName = ingredientName.toLowerCase().trim();

                // Skip if already in grocery list
                if (existingIngredientNames.contains(lowerName)) {
                    return;
                }

                // Check if ingredient contains any common item
                boolean isCommonItem = commonItems.stream()
                        .anyMatch(common -> lowerName.contains(common) || common.contains(lowerName));

                if (!isCommonItem) {
                    priceList.stream()
                            .filter(ing -> ing.getName().equalsIgnoreCase(ingredientName))
                            .findFirst()
                            .ifPresent(ingredient -> {
                                UserIngredient userIngredient = new UserIngredient(user, ingredient);
                                user.getGroceryList().add(userIngredient);
                                existingIngredientNames.add(lowerName); // Track it
                            });
                }
            });
        }
    }

    //Removes all duplicate meal plans from a specified user meal plan
    public void removeDuplicates(User user, List<UserMealPlan> existingPlan) {
        Set<Long> existingPlanRecipeIds = existingPlan.stream()
                .filter(Objects::nonNull)
                .filter(plan -> plan.getRecipe() != null)
                .map(plan -> plan.getRecipe().getId())
                .collect(Collectors.toSet());

        user.getMealPlans().removeIf(plan ->
                plan != null &&
                        plan.getRecipe() != null &&
                        existingPlanRecipeIds.contains(plan.getRecipe().getId()) &&
                        !plan.isPlanned()
        );
    }

    //Returns a random meal from a query
    public List<Recipe> random() {
        int req = 2;
        List<Recipe> subList = recipeRepository.findRandomRecipes(req);

        return subList;
    }


    public ArrayList<Recipe> filterRecipes(ArrayList<Recipe> recipieList, int maxMealPlanSize, int calories, int meals) {
        //build list of each type, and category
        Map<String, List<String>> categoryMap = Map.of(
                "meat", Arrays.asList("Chicken", "Beef"),
                "veg", Arrays.asList("Vegetarian", "Vegan"),
                "carb", Arrays.asList("Breakfast")
        );

        //create map for each limit of each category
        Map<String, Integer> limits = Map.of(
                "meat", (int) Math.round(maxMealPlanSize * 0.60),
                "veg", (int) Math.round(maxMealPlanSize * 0.20),
                "carb", (int) Math.round(maxMealPlanSize * 0.20)
        );

        double calPerMeal = (double) (calories / meals);
        List<Recipe> filtered = new ArrayList<>();

        // filter by calories if too close to max, then filter to add to the pool, based on recipe category
        Map<String, List<Recipe>> pools = recipieList.stream()
                .filter(r -> Math.abs(r.getCalories() - calPerMeal) <= calPerMeal + 100)
                .sorted(Comparator.comparingInt(r -> Math.abs(r.getCalories() - (int) calPerMeal)))
                .collect(Collectors.groupingBy(recipe ->
                        categoryMap.entrySet().stream()
                                .filter(e -> e.getValue().contains(recipe.getCategory()))
                                .map(Map.Entry::getKey)
                                .findFirst()
                                .orElse("other")
                ));

        // Add recipes from each pool up to limit using limits map
        for (String type : Arrays.asList("meat", "veg", "carb")) {
            pools.getOrDefault(type, Collections.emptyList()).stream()
                    .limit(limits.getOrDefault(type, 0))
                    .forEach(filtered::add);
        }

        // Fill remaining slots if needed if not enough meals are in each category
        if (filtered.size() < maxMealPlanSize) {
            recipieList.stream()
                    .filter(r -> !filtered.contains(r))
                    .sorted(Comparator.comparingInt(r -> Math.abs(r.getCalories() - (int) calPerMeal)))
                    .limit(maxMealPlanSize - filtered.size())
                    .forEach(filtered::add);
        }

        return new ArrayList<>(filtered);
    }

    public Integer getProgress(User user) {
        int calories = user.getPreferences().getCalories();

        // Query db for eaten calories
        Integer eatenCalories = recipeRepository.findEatenRecipesByUserID(user.getId());

        // Handle null case (no eaten meals yet)
        if (eatenCalories == null || eatenCalories == 0) {
            return 0;
        }

        if (calories == 0) {
            return 0;
        }

        return Math.toIntExact(Math.round(((float) eatenCalories / calories) * 100));
    }
}
