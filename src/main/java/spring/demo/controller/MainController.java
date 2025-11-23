/*
This class does the main logic of the applications pages and data, handling onboarding, meal data, and main user requests after authorized.
 */

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
import org.springframework.http.HttpStatus;
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
import spring.demo.models.repository.IngredientRepository;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;
import spring.demo.service.MealPlanService;
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
    private MealPlanService mealPlanService;

    private IngredientRepository ingredientRepository;
    private RecipeRepository recipeRepository;
    private static final Logger log = LoggerFactory.getLogger(MainController.class);


    private ArrayList<Recipe> recipieList = new ArrayList<Recipe>();
    private ArrayList<Ingredient> priceList = new ArrayList<Ingredient>();


    @Autowired
    public MainController(UserRepository userRepository, JwtService jwtService, AuthenticationManager authenticationManager,
                          MealService mealService, NutritionService nutritionService,
                          PriceService priceService, IngredientRepository ingredientRepository, RecipeRepository recipeRepository, MealPlanService mealPlanService) {
        super();
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.mealService = mealService;
        this.nutritionService = nutritionService;
        this.priceService = priceService;
        this.ingredientRepository = ingredientRepository;
        this.recipeRepository = recipeRepository;
        this.mealPlanService = mealPlanService;
    }

    // Handles the inital onboarding of saving userPreferences, loading and sorting meals, providing them back to the user and saving all data
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

        //Return filtered list after onboarding
        try {
            recipieList = mealPlanService.loadandFilterRecipies(user);
        } catch (Exception e) {
            e.printStackTrace();
        }
        //Save new ingredients
        for (Ingredient ingredient : priceList) {
            ingredientRepository.save(ingredient);

        }

        mealPlanService.findAndSaveMealPlan(user);
        userRepository.save(user);
        return ResponseEntity.ok(recipieList);
    }


    @PostMapping("/updatePref")
    public ResponseEntity<?> updatePref(@RequestBody UserPreference pref, @AuthenticationPrincipal UserDetails userDetails) throws JsonProcessingException {
        String email = userDetails.getUsername();
        if (email == null) {
            log.warn("User details or email is null!");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        // Update preferences
        user.setPreferences(pref);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    //Updates a specific meal to mark as eaten given a meal
    @PutMapping("/meal/updateMeal")
    @Transactional
    public ResponseEntity<?> updateMeal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = true) String name) {

        String username = userDetails.getUsername();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Find the UserMealPlan that matches the recipe name AND is planned
        Optional<UserMealPlan> mealPlanToMark = user.getMealPlans().stream()
                .filter(mealPlan -> mealPlan.getRecipe() != null)
                .filter(UserMealPlan::isPlanned) // CRITICAL: Only get planned meals
                .filter(mealPlan -> mealPlan.getRecipe().getName().equals(name))
                .findFirst();

        if (mealPlanToMark.isPresent()) {
            UserMealPlan mealPlan = mealPlanToMark.get();
            mealPlan.setEaten(true);

            log.info("Marking planned meal as eaten: {}", mealPlan.getRecipe().getName());
            log.info("MealPlan ID: {}, Planned: {}, Eaten: {}",
                    mealPlan.getId(), mealPlan.isPlanned(), mealPlan.isEaten());

            // Save the user with the updated meal plan
            userRepository.save(user);

            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "message", "Meal marked as eaten",
                            "recipe", mealPlan.getRecipe().getName(),
                            "mealPlanId", mealPlan.getId()
                    ));
        } else {
            log.warn("No PLANNED meal found with recipe name: '{}'", name);

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "error", "Planned meal not found for recipe: " + name
                    ));
        }
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

    //Returns more detailed meal data given a meal
    @GetMapping("/meal")
    @Transactional
    public ResponseEntity<?> meal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = true) String name) {

        String username = userDetails.getUsername();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (name == null || name.isBlank()) {
            log.warn("Bad request: 'name' parameter is missing or blank");
            return ResponseEntity.badRequest().body("Missing required parameter: name");
        }

        Optional<Recipe> recipe = recipieList.stream()
                .filter(r -> r.getName() != null && r.getName().equalsIgnoreCase(name))
                .findFirst();

        // Search DB if not found locally
        if (recipe.isEmpty()) {
            log.debug("Recipe not found in memory list. Checking database...");
            recipe = user.getMealPlans().stream()
                    .map(UserMealPlan::getRecipe)
                    .filter(r -> r.getName().equalsIgnoreCase(name))
                    .findFirst();
        }

        // If still not found
        if (recipe.isEmpty()) {
            log.warn("Recipe not found: {}", name);
            return ResponseEntity.status(404).body("Recipe not found: " + name);
        }
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
        List<Recipe> subList = recipeRepository.findRandomRecipes(req);

        return ResponseEntity.ok(subList);
    }

    @GetMapping("/selectMeals")
    @Transactional
    public ResponseEntity<List<Recipe>> selectMeals(@AuthenticationPrincipal UserDetails userDetails) {
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
                subList = mealPlanService.generateSubRecipeList(req, calorie, existingPlan, new ArrayList<>());

                // Continue to save the new meals below

            } else if (subList.size() == req || subList.size() == req + 1) {
                // Return existing planned meals (not all eaten yet)
                log.info("Returning {} existing planned meals", subList.size());
                return ResponseEntity.ok(subList);
            }
        }

        // Build new meal plan if we don't have enough
        if (subList.size() < req) {
            log.info("Need more meals. Generating {} meals...", req - subList.size());
            subList = mealPlanService.generateSubRecipeList(req, calorie, existingPlan, subList);
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

        mealPlanService.removeDuplicates(user, existingPlan);

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
}
