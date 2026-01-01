package spring.demo.services;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import spring.demo.models.Recipe;
import spring.demo.models.User;
import spring.demo.models.UserMealPlan;
import spring.demo.models.UserPreference;
import spring.demo.models.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import spring.demo.service.MealPlanService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UnitTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Autowired
    private MealPlanService mealPlanService;
    
    @Test
    void checkUnitTypeGram(){
        String res = mealPlanService.getUnitType("200g");
        assertEquals("grams", res);
    }

    @Test
    void checkNoType(){
        String res = mealPlanService.getUnitType("5 oranges");
        assertEquals("count", res);
    }

    @Test
    void checkUserProgress() {
        // Given
        User testUser = new User();
        testUser.setEmail("test@example.com");

        UserPreference pref = new UserPreference();
        pref.setMeals(3);
        pref.setCalories(2000);
        pref.setBudget(100.0);

        testUser.setPreferences(pref);
        testUser.setMealPlans(new ArrayList<>()); // important

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));

        // When
        int progress = mealPlanService.getProgress(testUser);

        // Then
        assertEquals(0, progress);
    }

    @Test
    void shouldRemoveDuplicateUnplannedMealsSuccessfully() {
        // Given - User has duplicate recipe in meal plans (one planned, one not)
        Recipe recipe = new Recipe();
        recipe.setId(1L);
        recipe.setName("Beef Stroganoff");

        UserMealPlan plannedMeal = new UserMealPlan();
        plannedMeal.setId(1L);
        plannedMeal.setRecipe(recipe);
        plannedMeal.setPlanned(true);  // This should stay

        UserMealPlan unplannedDuplicate = new UserMealPlan();
        unplannedDuplicate.setId(2L);
        unplannedDuplicate.setRecipe(recipe);
        unplannedDuplicate.setPlanned(false);  // This should be removed

        User user = new User();
        user.setMealPlans(new ArrayList<>(List.of(plannedMeal, unplannedDuplicate)));

        List<UserMealPlan> existingPlan = List.of(plannedMeal);

        // When
        mealPlanService.removeDuplicates(user, existingPlan);

        // Then
        assertEquals(1, user.getMealPlans().size());
        assertTrue(user.getMealPlans().get(0).isPlanned());
        assertEquals(1L, user.getMealPlans().get(0).getId());
    }

    @Test
    void shouldNotRemoveNonDuplicateMeals() {
        Recipe recipe1 = new Recipe();
        recipe1.setId(1L);
        recipe1.setName("Beef Stroganoff");

        Recipe recipe2 = new Recipe();
        recipe2.setId(2L);
        recipe2.setName("Chicken Tikka");

        UserMealPlan meal1 = new UserMealPlan();
        meal1.setId(1L);
        meal1.setRecipe(recipe1);
        meal1.setPlanned(true);

        UserMealPlan meal2 = new UserMealPlan();
        meal2.setId(2L);
        meal2.setRecipe(recipe2);
        meal2.setPlanned(false);

        User user = new User();
        user.setMealPlans(new ArrayList<>(List.of(meal1, meal2)));

        List<UserMealPlan> existingPlan = List.of(meal1);

        // When
        mealPlanService.removeDuplicates(user, existingPlan);

        // Then - Both should remain since recipe IDs are different
        assertEquals(2, user.getMealPlans().size());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void shouldReturnTwoRandomRecipes() throws Exception {
        // When & Then
        List<Recipe> recipeList = mealPlanService.random();
        assertEquals(2, recipeList.size());
    }








}

