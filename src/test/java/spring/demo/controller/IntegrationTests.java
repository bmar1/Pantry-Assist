package spring.demo.controller;

import jakarta.transaction.Transactional;
import org.apache.catalina.Store;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import spring.demo.models.*;
import spring.demo.models.repository.IngredientRepository;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class IntegrationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;  // Use MockMvc instead of TestRestTemplate

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private RecipeRepository recipeRepository;



    @Test
    @WithMockUser(username = "test@example.com")

    void dataAndCodeShouldBeReturned() throws Exception {
        mockMvc.perform(get("/api/meal").param("name", "Asado"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Asado"))
                .andExpect(jsonPath("$.area").value("Argentinian"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void shouldReturn404WhenRecipeNotFound() throws Exception {
        mockMvc.perform(get("/api/meal").param("name", "NonExistentRecipe"))
                .andExpect(status().isNotFound());
    }

    //test grocery endpoint
    @Test
    @WithMockUser(username = "test@example.com") //test acc
    void shouldReturnGroceryList() throws Exception {

        Optional<User> user = userRepository.findByEmail("test@example.com");

        Ingredient ingredient = new Ingredient();
        ingredient.setName("Beef");
        ingredient.setPrice(5.94);
        ingredientRepository.save(ingredient);

        UserIngredient userIngredient = new UserIngredient();
        userIngredient.setUser(user.get());
        userIngredient.setIngredient(ingredient);
        userIngredient.setPurchased(false);
        List<UserIngredient> list = new ArrayList<UserIngredient>();
        list.add(userIngredient);
        user.get().setGroceryList(list);
        userRepository.save(user.get());


        mockMvc.perform(get("/api/meals/groceryList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(username = "test@example.com") //test acc
    @Transactional
    void shouldReturnAllMeals() throws Exception {

        Optional<User> user = userRepository.findByEmail("test@example.com");

        Recipe recipe = new Recipe();
        recipe.setName("Beef Stroganoffs");
        recipe.setCalories(412);
        recipeRepository.save(recipe);

        UserMealPlan ump = new UserMealPlan();
        ump.setUser(user.get());
        ump.setRecipe(recipe);
        List<UserMealPlan> list = new ArrayList<UserMealPlan>();
        list.add(ump);

        Recipe recipe2 = new Recipe();
        recipe2.setName("Beef Qeema");
        recipe2.setCalories(412);
        recipeRepository.save(recipe2);

        UserMealPlan ump1 = new UserMealPlan();
        ump1.setUser(user.get());
        ump1.setRecipe(recipe2);
        list.add(ump1);


        user.get().setMealPlans(list);
        userRepository.save(user.get());


        mockMvc.perform(get("/api/meals/allMeals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "test@example.com") //test acc
    @Transactional
    void shouldReturnAllMeal404() throws Exception {

        Optional<User> user = userRepository.findByEmail("test@example.com");

        mockMvc.perform(get("/api/meals/allMeals"))
                .andExpect(status().isNotFound());
    }



    @Test
    void shouldReturn403WithoutAuth() throws Exception {
        // No @WithMockUser = no authentication
        mockMvc.perform(get("/api/meals/groceryList"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/meals/groceryList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));  // Check array is empty
    }


}
