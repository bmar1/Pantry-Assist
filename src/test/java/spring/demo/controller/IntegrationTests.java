package spring.demo.controller;

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
import spring.demo.models.Ingredient;
import spring.demo.models.User;
import spring.demo.models.UserIngredient;
import spring.demo.models.repository.IngredientRepository;
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

        Optional<User> user = userRepository.findByEmail("bilalutwo@example.com");

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
