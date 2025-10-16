package spring.demo.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import lombok.RequiredArgsConstructor;
import spring.demo.config.security.JwtService;
import spring.demo.models.AuthResponse;
import spring.demo.models.Ingredient;
import spring.demo.models.Recipe;
import spring.demo.models.RegisterRequest;
import spring.demo.models.User;
import spring.demo.models.UserPreference;
import spring.demo.models.UserRepository;
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
	
	
	private ArrayList<Recipe> recipieList = new ArrayList<Recipe>();
	private ArrayList<Ingredient> priceList = new ArrayList<Ingredient>();


	@Autowired
	public MainController(UserRepository userRepository, JwtService jwtService,
			AuthenticationManager authenticationManager, MealService mealService, NutritionService nutritionService) {
		super();
		this.userRepository = userRepository;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
		this.mealService = mealService;
		this.nutritionService = nutritionService;
	}

	// save user prefs to db
	@PostMapping("/onboarding")
	public ResponseEntity<ArrayList> onboarding(@RequestBody UserPreference pref, @AuthenticationPrincipal UserDetails userDetails) {
		String email = userDetails.getUsername();

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));


		// Update preferences
		user.setPreferences(pref);

		
		//Return filtered list after onboarding
		try {
			recipieList = loadandFilterRecipies(user);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		user.setMealPlan(recipieList);
		userRepository.save(user);
		return ResponseEntity.ok(recipieList);
	}
	
	@PostMapping("/getMeals")
	public ResponseEntity<List<Recipe>> meals(@AuthenticationPrincipal UserDetails userDetails) {
		String email = userDetails.getUsername();

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));

	
		return ResponseEntity.ok(user.getMealPlan());
	}
	
	@PostMapping("/getList")
	public ResponseEntity<ArrayList> list(@AuthenticationPrincipal UserDetails userDetails) {
		String email = userDetails.getUsername();

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));

	
		//return a price listreturn ResponseEntity.ok(recipieList);
		return null;
	}
	

	//Load and filter recipies 
	private ArrayList<Recipe> loadandFilterRecipies(@org.jetbrains.annotations.NotNull User user) throws Exception {
		
		int maxMeat = user.getPreferences().getMeals() == 2 ? 7 : 2 * 7;
		//Fill list
		recipieList.addAll(mealService.getMealsByIngredient("Chicken"));
		if(recipieList.size() < maxMeat + 18) {
			recipieList.addAll(mealService.getMealsByIngredient("Beef"));
		}
		recipieList.addAll(mealService.getMealsByCategory("Breakfast"));
		List<Recipe> vegMeals = mealService.getMealsByCategory("Vegetarian");

		int limit = Math.min(20, vegMeals.size());
		recipieList.addAll(vegMeals.subList(0, limit));
		
		//Filter in 3 steps and return final list
		recipieList = filterByCommonIngredientsOptimized(recipieList, 2); // require at least 2 shared ingredients
		recipieList = filterByCalories(recipieList, user);
		recipieList = filterByPrice(recipieList, user);

		 
		 return recipieList;
		
	}



    private ArrayList<Recipe> filterByPrice(ArrayList<Recipe> recipieList, User user) throws Exception {
		  ArrayList<Recipe> filtered = new ArrayList<>();
		// Removes a recipe if the price, based on serving size costs too much
		double costMax = user.getPreferences().getBudget() / (user.getPreferences().getMeals() * 7) + 0.3;
		
		// Add ingridients to list to cache
		 for (Recipe recipe : recipieList) {
			 if(getMealCost(recipe) < costMax) {
				 filtered.add(recipe);
			 }
		 }
		return filtered;
	}

	private double getMealCost(Recipe recipe) throws Exception {
        double mealCost = 0.0;

        for (Map.Entry<String, String> entry : recipe.getIngredients().entrySet()) {
            String ingName = entry.getKey();
            String usedAmount = entry.getValue(); // e.g. "200g" or "2 tbsp"

            // Find or fetch ingredient price info
            Ingredient ingredient = priceList.stream()
                    .filter(i -> i.getName().equalsIgnoreCase(ingName))
                    .findFirst()
                    .orElseGet(() -> {
                        try {
                            Ingredient fetched = priceService.getIngredient(ingName);
                            priceList.add(fetched);
                            return fetched;
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    });

            // Parse usage and serving size
            double recipeAmount = recipe.parseToGrams(usedAmount); // your helper
            double packageAmount = recipe.parseToGrams(ingredient.getTotalServings()); // e.g. "500g"

            if (packageAmount > 0) {
                double unitCost = ingredient.getTotalPrice() / packageAmount; // cost per gram
                mealCost += unitCost * recipeAmount; // total cost for used amount
            }
        }

        return mealCost / getServingSize(recipe);
	}

    /*
    @param: recipe to be used to calculate serving size
    This function takes the main protein source of a meal, based on weight determines its serving size assuming an adults avg protein intake
    It adds servings based on weight of other spices and ingredients
     */
	private int getServingSize(Recipe recipe) {
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
	    
	    //Get rid of each recipie if over max
	    for (Recipe recipe : recipes) {
	       try {
			recipe = nutritionService.searchMeal(recipe.getName(), recipe);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}

	        if (recipe.getCalories() <= max) {
	            filtered.add(recipe);
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

	

}

