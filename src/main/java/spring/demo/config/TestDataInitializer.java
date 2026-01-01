package spring.demo.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import spring.demo.models.*;
import spring.demo.models.repository.IngredientRepository;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;

import java.util.ArrayList;

/**
 * Initializes test data for all integration tests.
 */
@Component
@Profile("test")
public class TestDataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        System.out.println("=== Initializing Test Data ===");
        initializeTestUsers();
        initializeTestRecipes();
        initializeTestIngredients();
        System.out.println("=== Test Data Initialization Complete ===");
    }

    private void initializeTestUsers() {
        // Primary test user: test@example.com
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));

        UserPreference pref = new UserPreference();
        pref.setMeals(3);
        pref.setCalories(2000);
        pref.setBudget(100.0);
        testUser.setPreferences(pref);

        // Initialize empty collections (tests will populate dynamically)
        testUser.setMealPlans(new ArrayList<>());
        testUser.setGroceryList(new ArrayList<>());

        userRepository.save(testUser);
        System.out.println("Created user: test@example.com with preferences");

        // Secondary test user: test1@example.com
        // Must have EMPTY meal plans and grocery list for 404/empty tests
        User testUser1 = new User();
        testUser1.setEmail("test1@example.com");
        testUser1.setPassword(passwordEncoder.encode("password"));
        testUser1.setMealPlans(new ArrayList<>());
        testUser1.setGroceryList(new ArrayList<>());

        userRepository.save(testUser1);
        System.out.println("Created user: test1@example.com (empty lists)");
    }

    private void initializeTestRecipes() {
        // CRITICAL: Asado must have exact name and area for IntegrationTests.dataAndCodeShouldBeReturned
        Recipe asado = new Recipe();
        asado.setName("Asado");
        asado.setArea("Argentinian");
        asado.setCalories(500);
        asado.setCategory("Beef");
        asado.setInstructions("Grill the beef over an open flame...");
        recipeRepository.save(asado);
        System.out.println("Created recipe: Asado (Argentinian)");

        // Original 13 recipes
        String[][] recipesData = {
                {"Chicken Tikka Masala", "Indian", "Chicken", "450"},
                {"Beef Bourguignon", "French", "Beef", "600"},
                {"Pad Thai", "Thai", "Vegetarian", "400"},
                {"Sushi Roll", "Japanese", "Seafood", "300"},
                {"Tacos al Pastor", "Mexican", "Pork", "350"},
                {"Margherita Pizza", "Italian", "Vegetarian", "550"},
                {"Beef Stroganoff", "Russian", "Beef", "520"},
                {"Chicken Qeema", "Pakistani", "Chicken", "480"},
                {"Greek Salad", "Greek", "Vegetarian", "250"},
                {"Lasagna", "Italian", "Beef", "650"},
                {"Tom Yum Soup", "Thai", "Seafood", "200"},
                {"Butter Chicken", "Indian", "Chicken", "500"},
                {"Falafel Wrap", "Middle Eastern", "Vegetarian", "380"},
                {"Moussaka", "Greek", "Beef", "580"},
                {"Paella", "Spanish", "Seafood", "450"},
                {"Ramen", "Japanese", "Pork", "420"},
                {"Biryani", "Indian", "Chicken", "540"},
                {"Pho", "Vietnamese", "Beef", "380"},
                {"Kebab", "Turkish", "Lamb", "490"},
                {"Goulash", "Hungarian", "Beef", "510"},
                {"Couscous", "Moroccan", "Vegetarian", "360"},
                {"Chili Con Carne", "American", "Beef", "470"},
                {"Carbonara", "Italian", "Pork", "620"},
                {"Shakshuka", "Israeli", "Vegetarian", "310"},
                {"Jambalaya", "American", "Chicken", "480"},
                {"Dumplings", "Chinese", "Pork", "350"},
                {"Bulgogi", "Korean", "Beef", "440"},
                {"Tandoori Chicken", "Indian", "Chicken", "430"},
                {"Fish and Chips", "British", "Seafood", "560"},
                {"Pozole", "Mexican", "Pork", "410"},
                {"Risotto", "Italian", "Vegetarian", "390"},
                {"Borscht", "Russian", "Vegetarian", "280"},
                {"Satay", "Indonesian", "Chicken", "370"},
                {"Shepherd's Pie", "British", "Lamb", "530"},
                {"Enchiladas", "Mexican", "Chicken", "460"},
                {"Schnitzel", "German", "Pork", "550"},
                {"Pesto Pasta", "Italian", "Vegetarian", "420"},
                {"Lamb Vindaloo", "Indian", "Lamb", "590"},
                {"Pulled Pork", "American", "Pork", "520"},
                {"Teriyaki Chicken", "Japanese", "Chicken", "400"},
                {"Beef Tacos", "Mexican", "Beef", "380"},
                {"Chicken Parmesan", "Italian", "Chicken", "570"},
                {"Seafood Paella", "Spanish", "Seafood", "480"},
                {"Beef Wellington", "British", "Beef", "720"},
                {"Chicken Fajitas", "Mexican", "Chicken", "410"},
                {"Tuna Poke Bowl", "Hawaiian", "Seafood", "340"},
                {"Chicken Korma", "Indian", "Chicken", "490"},
                {"Beef Stir Fry", "Chinese", "Beef", "430"},
                {"Vegetable Curry", "Indian", "Vegetarian", "320"},
                {"BBQ Ribs", "American", "Pork", "640"},
                {"Chicken Shawarma", "Middle Eastern", "Chicken", "420"},
                {"Lobster Thermidor", "French", "Seafood", "680"},
                {"Chicken Pad See Ew", "Thai", "Chicken", "450"},
                {"Beef Brisket", "American", "Beef", "610"},
                {"Tofu Stir Fry", "Chinese", "Vegetarian", "290"},
                {"Lamb Gyro", "Greek", "Lamb", "470"},
                {"Chicken Katsu", "Japanese", "Chicken", "520"},
                {"Vegetable Lasagna", "Italian", "Vegetarian", "480"},
                {"Salmon Teriyaki", "Japanese", "Seafood", "390"},
                {"Beef Chow Mein", "Chinese", "Beef", "460"},
                {"Chicken Burrito", "Mexican", "Chicken", "540"},
                {"Eggplant Parmesan", "Italian", "Vegetarian", "440"},
                {"Prawn Curry", "Indian", "Seafood", "420"},
                {"Pork Schnitzel", "Austrian", "Pork", "580"},
                {"Chicken Souvlaki", "Greek", "Chicken", "410"},
                {"Beef Rendang", "Indonesian", "Beef", "550"},
                {"Veggie Burger", "American", "Vegetarian", "370"},
                {"Duck Confit", "French", "Duck", "620"},
                {"Chicken Alfredo", "Italian", "Chicken", "590"}
        };

        for (String[] data : recipesData) {
            Recipe recipe = new Recipe();
            recipe.setName(data[0]);
            recipe.setMealCost(2.00);
            recipe.setArea(data[1]);
            recipe.setCategory(data[2]);
            recipe.setCalories(Integer.parseInt(data[3]));
            recipe.setInstructions("Cook " + data[0] + " following traditional methods.");
            recipeRepository.save(recipe);
        }

        System.out.println("Created " + (recipesData.length + 1) + " recipes total");
        System.out.println("Recipe breakdown by category:");
    }

    /**
     * Creates base ingredients for tests.
     */
    private void initializeTestIngredients() {
        String[] ingredientNames = {
                "Beef", "Chicken", "Rice", "Tomato", "Onion",
                "Garlic", "Olive Oil", "Salt", "Pepper", "Pasta"
        };

        double[] prices = {1.99, 1.99, 2.99, 1.99, 0.99,
                0.79, 2.99, 1.49, 2.49, 3.99};

        for (int i = 0; i < ingredientNames.length; i++) {
            Ingredient ingredient = new Ingredient(ingredientNames[i]);
            ingredient.setPrice(prices[i]);
            ingredientRepository.save(ingredient);
        }

        System.out.println("Created " + ingredientNames.length + " base ingredients");
    }
}