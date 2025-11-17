package spring.demo.controller;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;


import jakarta.transaction.Transactional;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;
import spring.demo.config.security.JwtService;
import spring.demo.models.*;
import spring.demo.service.MealService;
import spring.demo.service.NutritionService;
import spring.demo.service.PriceService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MainController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private MealService mealService;
    private NutritionService nutritionService;
    private PriceService priceService;
    private IngredientRepository ingredientRepository;
    private RecipeRepository recipeRepository;
    private static final Logger log = LoggerFactory.getLogger(MainController.class);


    private ArrayList<Recipe> recipieList = new ArrayList<Recipe>();
    private ArrayList<Ingredient> priceList = new ArrayList<Ingredient>();


    @Autowired
    public MainController(UserRepository userRepository, JwtService jwtService, AuthenticationManager authenticationManager,
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

    // Accepts new user onboard data, or onboards user and returns relevant recipes to dedicated user, and saves them
    @PostMapping("/onboarding")
    @Transactional
    public ResponseEntity<ArrayList> onboarding(@RequestBody UserPreference pref, @AuthenticationPrincipal UserDetails userDetails) throws JsonProcessingException {
        String email = userDetails.getUsername();
        if (email == null) {
            log.warn("User details or email is null!");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        // Update preferences
        user.setPreferences(pref);

        //If not updating, save all new data to the user
        if (!pref.isUpdate()) {
            //Return filtered list after onboarding
            try {
                recipieList = loadandFilterRecipies(user);
            } catch (Exception e) {
                e.printStackTrace();
            }

            for (Ingredient ingredient : priceList) {
                ingredientRepository.save(ingredient);

            }

            for (Recipe recipe : recipieList) {
                // Add to meal plan
                UserMealPlan mealPlan = new UserMealPlan(user, recipe);
                user.getMealPlan().add(mealPlan);

                // Add matching ingredients in meal plan
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
            for (Recipe recipe : recipieList) {
                recipeRepository.save(recipe);
            }
            userRepository.save(user);
            return ResponseEntity.ok(recipieList);
        }
        userRepository.save(user);
        return ResponseEntity.ok(null);
    }


    //Returns all user meals by fetching from DB, accepting a number of meals to return as well
    @GetMapping("/allMeals")
    @Transactional
    public ResponseEntity<List<Recipe>> meals(@AuthenticationPrincipal UserDetails userDetails, @RequestParam(required = false) Integer numIngredients) {
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            List<Recipe> userRecipes = recipeRepository.findRecipesByUserId(user.getId());
            return ResponseEntity.ok(userRecipes);
    }

    //Returns specific meal data, accepting a user detail, and a specific meal query
    @GetMapping("/meal")
    @Transactional
    public ResponseEntity<?> meal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = true) String name) {

        String username = userDetails.getUsername();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        // Validate input
        if (name == null || name.isBlank()) {
            log.warn("Bad request: 'name' parameter is missing or blank");
            return ResponseEntity.badRequest().body("Missing required parameter: name");
        }

        // Search local list
        Optional<Recipe> recipe = recipieList.stream()
                .filter(r -> r.getName() != null && r.getName().equalsIgnoreCase(name))
                .findFirst();

        // Search DB if not found locally
        if (recipe.isEmpty()) {
            log.debug("Recipe not found in memory list. Checking database...");
            recipe = user.getMealPlan().stream()
                    .map(UserMealPlan::getRecipe)
                    .filter(r -> r.getName().equalsIgnoreCase(name))
                    .findFirst();
        }

        // If still not found
        if (recipe.isEmpty()) {
            log.warn("Recipe not found: {}", name);
            return ResponseEntity.status(404).body("Recipe not found: " + name);
        }

        // Log success
        log.info("Recipe found: {} (requested by user: {})",
                recipe.get().getName(),
                userDetails != null ? userDetails.getUsername() : "anonymous");

        return ResponseEntity.ok(recipe.get());
    }

    //Return a random recipe from DB
    @Transactional
    @GetMapping("/random")
    public ResponseEntity<List<Recipe>> random(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        int req = 2;

        // Find two random meals
        List<Recipe> subList = recipeRepository.findRandomRecipes(req);

        return ResponseEntity.ok(subList);
    }

    //Accepts a count of meals to return, and either generates a new meal plan for the day or returns the meal plan for the day
    @GetMapping("/selectMeals")
    @Transactional
    public ResponseEntity<List<Recipe>> selectMeals(@AuthenticationPrincipal UserDetails userDetails, Integer count) {
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        int req = user.getPreferences().getMeals();
        int calorie = user.getPreferences().getCalories();
        List<Recipe> subList = new ArrayList<>();

        // Step 1: Check if user has a meal plan
        List<UserMealPlan> existingPlan = user.getMealPlan();

        if (existingPlan != null && !existingPlan.isEmpty()) {
            // Step 2: Extract recipes and filter for planned meals
            log.warn("Recipes filtered and extracted!");

            subList = existingPlan.stream()
                    .filter(UserMealPlan::isPlanned)
                    .map(UserMealPlan::getRecipe)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if(subList.isEmpty()){
                log.warn("Recipes filtered and extracted!");
                subList = recipeRepository.findMarkedRecipesByUserId(user.getId());
            }

            // If we have enough planned meals, return them immediately
            if(subList.size() > 1)
                return ResponseEntity.ok(subList);
        }

        // Step 3: If not enough planned meals, fetch all user meals from DB
        List<Recipe> allUserMeals = null;
        if (subList.size() < req) {
            log.warn("Generating NEW sublist");
            allUserMeals = existingPlan.stream()
                    .map(UserMealPlan::getRecipe)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            // Step 4: Still not enough - generate plan from existing meals
            subList = generateSubRecipeList(req, calorie, allUserMeals, subList);
        }


        //Save and overwrrite new planned meals
        for (Recipe recipe : subList) {
            UserMealPlan mealPlan = new UserMealPlan();
            mealPlan.setRecipe(recipe);
            mealPlan.setPlanned(true);
            mealPlan.setUser(user);

            existingPlan.add(mealPlan);
        }

        //Edit the existing plan to map by recipe ids, matching already found recipes and overrwriting them with new planned ones
        Set<Long> existingPlanRecipeIds = existingPlan.stream()
                .map(plan -> plan.getRecipe().getId())
                .collect(Collectors.toSet());

        user.getMealPlans().removeIf(plan ->
                existingPlanRecipeIds.contains(plan.getRecipe().getId()) &&
                        !plan.isPlanned()
        );

        user.getMealPlans().addAll(existingPlan);
        userRepository.save(user);

        return ResponseEntity.ok(subList);
    }


    //Returns the users grocery list by items found in the recipe list
    @GetMapping("/grocery")
    public ResponseEntity<List<Ingredient>> list(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Ingredient> ingredients = user.getGroceryList().stream()
                .map(UserIngredient::getIngredient)
                .toList();

        return ResponseEntity.ok(ingredients);
    }
	

	//Main algorithm: This loads and filtered recipes by several categories, filters them by cost, price and ingredeints, returning a final list
	private ArrayList<Recipe> loadandFilterRecipies(@NotNull User user) throws Exception {

        int maxMeat = user.getPreferences().getMeals() * 7;

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

        log.info("Size of recipe: {}", recipieList.size());
		
		//Filter in 3 steps and return final list
		recipieList = filterByCommonIngredientsOptimized(recipieList, 2); // require at least 2 shared ingredients
        System.out.println("Recipies filter!");
		recipieList = filterByCalories(recipieList, user);
		recipieList = filterByPrice(recipieList, user);
        System.out.println("Filtered by price!");

		 return recipieList;
	}

    private ArrayList<Recipe> filterByPrice(ArrayList<Recipe> recipieList, User user) throws Exception {
		  ArrayList<Recipe> filtered = new ArrayList<>();
		// Removes a recipe if the price, based on serving size costs too much
		double costMax = user.getPreferences().getBudget() / (user.getPreferences().getMeals() * 7) + 1.2;
		

		 for (Recipe recipe : recipieList) {
			 if(getMealCost(recipe) < costMax) {
				 filtered.add(recipe);
			 }
		 }
		return filtered;
	}

    //Determines the meal cost from a recipe by finding locally or from DB, or fetching price based on ingredients from Walmart API
	private double getMealCost(Recipe recipe) throws Exception {
        double mealCost = 0.0;

        Optional<Ingredient> ingredient = null;
        for (Map.Entry<String, String> entry : recipe.getIngredients().entrySet()) {
            String ingName = entry.getKey();
            String usedAmount = entry.getValue(); // e.g. "200g" or "2 tbsp"
            ingredient = Optional.empty();

            String query = ingName.trim().toLowerCase();

            Optional<Ingredient> local = priceList.stream()
                    .filter(i -> i != null && i.getName() != null)
                    .filter(i -> i.getName().trim().toLowerCase().equals(query))
                    .findFirst();

            if (local.isPresent()) {
                ingredient = local;
                log.info("Already found locally: {}", ingName);
            }

            else {
                Optional<Ingredient> dbIngredient = ingredientRepository.findByNameIgnoreCase(query);

                if (dbIngredient.isPresent()) {
                    Ingredient dbIng = dbIngredient.get();
                    ingredient = dbIngredient;  // Assign here
                    log.info("Found in DB: {}", ingName);
                    log.info("Cache valid? {}", dbIng.isCacheValid());

                    if (dbIng.isCacheValid()) {
                        priceList.add(dbIng);
                    } else {
                        // Cache expired → refresh from API
                        try {
                            Ingredient fresh = priceService.getIngredient(ingName);
                            if (fresh != null) {
                                fresh.setId(dbIng.getId());
                                fresh.setName(query);  // Normalize

                                ingredient = Optional.of(fresh); // Replace assigned ingredient
                                priceList.add(fresh);

                                ingredientRepository.save(fresh);
                                ingredientRepository.flush();
                                log.info("Refreshed DB ingredient: {}", ingName);
                            }
                        } catch (Exception e) {
                            log.error("Error refreshing ingredient: {}", ingName, e);
                        }
                    }
                }
                // Step 3 — Not in cache or DB → fetch new
                else {
                    try {
                        Ingredient fresh = priceService.getIngredient(ingName);
                        if (fresh != null) {
                            fresh.setName(query); // Normalize for consistent lookup
                            ingredient = Optional.of(fresh);
                            //Fetch and save new ingredient
                            priceList.add(fresh);
                            ingredientRepository.save(fresh);
                            ingredientRepository.flush();

                            log.info("Fetched NEW ingredient and saved: {}", ingName);
                        } else {
                            ingredient = Optional.empty();
                            log.warn("Could not fetch ingredient from API: {}", ingName);
                        }
                    } catch (Exception e) {
                        ingredient = Optional.empty();
                        log.error("Error fetching ingredient: {}", ingName, e);
                    }
                }
            }

            if (ingredient.isPresent()) {
                //determine typing and convert to smallest (ml, g or just 1-off)
                double recipeAmount = 0;
                double packageAmount = 0;

                //determine type
                if (usedAmount.endsWith("g") || usedAmount.endsWith("kg")) {
                    //gram, convert recipe to gram and move
                    recipeAmount = recipe.parseToGrams(usedAmount);
                    packageAmount = recipe.parseToGrams(String.valueOf(ingredient.get().getServingsPerContainer()));
                } else if (usedAmount.endsWith("ml") || usedAmount.endsWith("l")) {
                    //water, convert to water and move
                    recipeAmount = recipe.parseToMilliliters(usedAmount);
                    packageAmount = recipe.parseToMilliliters(String.valueOf(ingredient.get().getServingsPerContainer()));
                } else if (usedAmount.endsWith("tsb") || usedAmount.endsWith("tbs") || usedAmount.endsWith("tblsp")) {
                    //convert to tsb
                    recipeAmount = recipe.parseToTeaspoons(usedAmount);
                    packageAmount = recipe.parseToTeaspoons(String.valueOf(ingredient.get().getServingsPerContainer()));
                } else {
                    //Handle the case where it's just 1 count, not measureable and convert to a double
                    Matcher m = Pattern.compile("(\\d+\\.?\\d*)").matcher(usedAmount);
                    if (m.find()) {
                        recipeAmount = Double.parseDouble(m.group(1));
                    }

                    Matcher m2 = Pattern.compile("(\\d+\\.?\\d*)").matcher(ingredient.get().getServingsPerContainer());
                    if (m2.find()) {
                        packageAmount = Double.parseDouble(m2.group(1));
                    }

                }


                if (packageAmount > 0) {
                    double unitCost = ingredient.get().getTotalPrice() / packageAmount; // cost per metric
                    mealCost += unitCost * recipeAmount;
                    log.info("Meal Cost: {}", mealCost);
                }

            }

        }
        recipe.setMealCost(mealCost);
        return mealCost;
	}


    /*
    @param: recipe to be used to calculate serving size
    This function takes the main protein source of a meal, based on weight determines its serving size assuming an adults avg protein intake
    It adds servings based on weight of other spices and ingredients
     */
	public int getServingSize(Recipe recipe) {
	    int proteinWeight = recipe.extract_weight("Chicken");
        if(proteinWeight == 0){
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
            if (recipe.getCalories() == 0) {
                try {
                    nutritionService.searchMeal(recipe.getName(), recipe);
                } catch (JsonProcessingException e) {
                    log.error("Failed to process nutrition data for recipe: {}", recipe.getName(), e);


                }
            }

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

    private List<Recipe> generateSubRecipeList(int req, int calorie, List<Recipe> existingPlan, List<Recipe> alreadySelected) {
        List<Recipe> list = new ArrayList<>(alreadySelected);
        int min = calorie / req;

        // Calculate how many more meals we need
        int needed = req - list.size();

        // Step 1: Try to find meals from existing plan that meet daily requirements
        if (existingPlan != null && !existingPlan.isEmpty()) {
            for (Recipe recipe : existingPlan) {
                if (list.size() >= req) break;

                // Skip if already selected
                if (list.contains(recipe)) continue;

                // Check if recipe meets calorie requirements (min ± range)
                if (recipe.getCalories() >= min - 120 && recipe.getCalories() <= min + 120) {
                    list.add(recipe);

                }
            }
        }

        // Step 2: If still need more meals, check in-memory recipes
        if (list.size() < req && recipieList != null) {
            for (Recipe recipe : recipieList) {
                if (list.size() >= req) break;

                if (!list.contains(recipe) &&
                        recipe.getCalories() >= min - 120 &&
                        recipe.getCalories() <= min + 120) {
                    list.add(recipe);

                }
            }
        }

        // Step 3: If still need more, query database
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

        //If we are still under our requirements, add a small meal to fill the diet
        if (totalCalories < calorie) {
            int gap = calorie - totalCalories;

            // Try existing plan first
            Recipe closestRecipe = null;
            if (existingPlan != null) {
                closestRecipe = existingPlan.stream()
                        .filter(r -> !list.contains(r))
                        .min(Comparator.comparingInt(r -> Math.abs(r.getCalories() - gap)))
                        .orElse(null);
            }

            // Try in-memory if not found
            if (closestRecipe == null && recipieList != null) {
                closestRecipe = recipieList.stream()
                        .filter(r -> !list.contains(r))
                        .min(Comparator.comparingInt(r -> Math.abs(r.getCalories() - gap)))
                        .orElse(null);
            }

            // Check database if still not found
            if (closestRecipe == null) {
                closestRecipe = recipeRepository.findClosestToCalorieTarget(gap, 0, Integer.MAX_VALUE);
            }

            if (closestRecipe != null && !list.contains(closestRecipe)) {
                list.add(closestRecipe);

            }
        }



        return list;
    }




}


