/*
This class does the main logic of the applications pages and data, handling onboarding, meal data, and main user requests after authorized.
 */

package spring.demo.controller;

import java.time.LocalDate;
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
    public ResponseEntity<ArrayList> onboarding(@RequestBody UserPreference pref,
                                                @AuthenticationPrincipal UserDetails userDetails)
            throws JsonProcessingException {
        String email = userDetails.getUsername();

        if (email == null) {
            log.error("User details or email is null!");
            return ResponseEntity.status(500).build();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if(pref.getCalories() == 0 || pref.getBudget() == 0 || pref.getMeals() <= 1){
            return ResponseEntity.badRequest().build();
        }

        user.setPreferences(pref);


        // Return filtered list after onboarding
        try {
            recipieList = mealPlanService.loadandFilterRecipies(user, recipieList, priceList);
        } catch (Exception e) {
            log.error("ERROR in loadandFilterRecipies", e);
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }

        // Save new ingredients
        if(!priceList.isEmpty()) {
            log.info("Saving {} ingredients", priceList.size());
            for (Ingredient ingredient : priceList) {
                ingredientRepository.save(ingredient);
            }
        }

        user.getGroceryList().clear();
        user.getMealPlans().clear();

        int MAX_MEAL_PLAN_SIZE = (user.getPreferences().getMeals() * 7);


        if(recipieList.size() > MAX_MEAL_PLAN_SIZE){
            recipieList = mealPlanService.filterRecipes(recipieList, MAX_MEAL_PLAN_SIZE,
                    user.getPreferences().getCalories(), user.getPreferences().getMeals());
        }

        mealPlanService.findAndSaveMealPlan(user, recipieList, priceList);

        userRepository.save(user);

        if(recipieList.isEmpty() || recipieList.size() < 13){
            return ResponseEntity.status(500).build();
        }

        log.info("=== ONBOARDING SUCCESS: Returning {} recipes ===", recipieList.size());
        return ResponseEntity.ok(recipieList);
    }

    @PostMapping("/meal-plans")
    @Transactional
    public ResponseEntity<ArrayList> newMealPlan(
                                                @AuthenticationPrincipal UserDetails userDetails)
            throws JsonProcessingException {
        String email = userDetails.getUsername();

        if (email == null) {
            log.error("User details or email is null!");
            return ResponseEntity.status(500).build();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if(user.getPreferences().getMeals() == 0 || user.getPreferences().getBudget() == 0 || user.getPreferences().getCalories() == 0){
            return ResponseEntity.badRequest().build();
        }


        // Return filtered list after onboarding
        try {
            recipieList = mealPlanService.loadandFilterRecipies(user, recipieList, priceList);
        } catch (Exception e) {
            log.error("ERROR in loadandFilterRecipies", e);
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }

        // Save new ingredients
        if(!priceList.isEmpty()) {
            log.info("Saving {} ingredients", priceList.size());
            for (Ingredient ingredient : priceList) {
                ingredientRepository.save(ingredient);
            }
        }

        user.getGroceryList().clear();
        user.getMealPlans().clear();

        int MAX_MEAL_PLAN_SIZE = (user.getPreferences().getMeals() * 7);


        if(recipieList.size() > MAX_MEAL_PLAN_SIZE){
            recipieList = mealPlanService.filterRecipes(recipieList, MAX_MEAL_PLAN_SIZE,
                    user.getPreferences().getCalories(), user.getPreferences().getMeals());
        }

        mealPlanService.findAndSaveMealPlan(user, recipieList, priceList);

        userRepository.save(user);

        if(recipieList.isEmpty() || recipieList.size() < 13){
            return ResponseEntity.status(500).build();
        }

        log.info("=== ONBOARDING SUCCESS: Returning {} recipes ===", recipieList.size());
        return ResponseEntity.ok(recipieList);
    }

    @GetMapping("/load")
    public ResponseEntity<?> loadDashboard(@AuthenticationPrincipal UserDetails userDetails) throws JsonProcessingException {
        // Get user
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Load all data
        List<Recipe> selectedMeals = mealPlanService.selectMeals(userDetails, recipieList);
        List<Recipe> randomMeals = mealPlanService.random();
        List<Ingredient> groceryList = groceryList(userDetails);

        Integer budget = (int) user.getPreferences().getBudget();

        // Calculate calorie stats (merged from getCalorieStats endpoint)
        int targetCalories = user.getPreferences().getCalories();
        Integer eatenToday = recipeRepository.getTodayEatenCalories(user.getId());
        if (eatenToday == null) eatenToday = 0;

        int remaining = Math.max(targetCalories - eatenToday, 0);

        if (selectedMeals.isEmpty() || randomMeals.isEmpty() || groceryList.isEmpty() || budget == 0) {
            return ResponseEntity.status(500).build();
        }

        Integer progress = targetCalories > 0
                ? Math.min((eatenToday * 100) / targetCalories, 100)
                : 0;

        DashboardData data = new DashboardData(selectedMeals, randomMeals, groceryList, progress,
                budget, eatenToday, targetCalories, remaining
        );

        return ResponseEntity.ok(data);
    }

    //updates a list of user preferences (calories, meals and goals)
    @PostMapping("/user/preferences")
    public ResponseEntity<?> updatePref(@RequestBody UserPreference pref, @AuthenticationPrincipal UserDetails userDetails) throws JsonProcessingException {
        String email = userDetails.getUsername();
        if (email == null) {
            log.warn("User details or email is null!");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if(pref.getCalories() == 0 || pref.getBudget() == 0){
            return ResponseEntity.badRequest().build();
        }

        // Update preferences
        user.setPreferences(pref);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    //Updates a specific meal to mark as eaten given a meal
    @PutMapping("/meals/updateMeal")
    @Transactional
    public ResponseEntity<?> updateMeal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = true) String name) {

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Meal name is required"
                    ));
        }

        String username = userDetails.getUsername();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Find the UserMealPlan that matches the recipe name AND is planned
        Optional<UserMealPlan> mealPlanToMark = user.getMealPlans().stream()
                .filter(mealPlan -> mealPlan.getRecipe() != null)
                .filter(UserMealPlan::isPlanned)
                .filter(mealPlan -> mealPlan.getRecipe().getName().equals(name))
                .findFirst();

        if (mealPlanToMark.isPresent()) {
            UserMealPlan mealPlan = mealPlanToMark.get();
            mealPlan.setEaten(true);
            mealPlan.setEatenDate(LocalDate.now());

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

            return ResponseEntity.status(404)
                    .body(Map.of(
                            "success", false,
                            "error", "Planned meal not found for recipe: " + name
                    ));
        }
    }

    //Returns all user meals by fetching from DB, accepting a number of meals to return as well
    @GetMapping("/meals")
    @Transactional
    public ResponseEntity<List<Recipe>> meals(@AuthenticationPrincipal UserDetails userDetails, @RequestParam(required = false) Integer numIngredients) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Recipe> userRecipes = recipeRepository.findRecipesByUserId(user.getId());
        if(userRecipes.isEmpty()){
            return ResponseEntity.status(404).build();
        }
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
            return ResponseEntity.badRequest().body("Missing required parameter: name");
        }

        Optional<Recipe> recipe = recipieList.stream()
                .filter(r -> r.getName() != null && r.getName().equalsIgnoreCase(name))
                .findFirst();

        // Search DB if not found locally
        if (recipe.isEmpty()) {
            recipe = recipeRepository.findByNameIgnoreCase(name);
        }

        if(!recipe.isEmpty())
            return ResponseEntity.ok(recipe.get());
        else return ResponseEntity.status(404).build();
    }
    @GetMapping("/user/grocery-list")
    public List<Ingredient> groceryList(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Ingredient> ingredients = user.getGroceryList().stream()
                .map(UserIngredient::getIngredient)
                .toList();

        if(ingredients.isEmpty()) {
            return new ArrayList<>();
        }

        return ingredients;
    }
}
