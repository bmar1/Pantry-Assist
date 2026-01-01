package spring.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.apache.catalina.Store;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import spring.demo.models.*;
import spring.demo.models.repository.IngredientRepository;
import spring.demo.models.repository.RecipeRepository;
import spring.demo.models.repository.UserRepository;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import com.fasterxml.jackson.databind.ObjectMapper;
import spring.demo.service.MealPlanService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class E2ETest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private ObjectMapper objectMapper;


    @Test
    @WithMockUser(username = "test@example.com")
    void shouldCompleteOnboardingSuccessfully() throws Exception {
        // Given - Valid user preferences
        UserPreference validPreferences = new UserPreference();
        validPreferences.setCalories(2000);
        validPreferences.setBudget(100.0);
        validPreferences.setMeals(3);


        mockMvc.perform(post("/api/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validPreferences)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(13)))
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].calories").exists());

        //ensure length is met + data

        // Verify user preferences were saved
        User user = userRepository.findByEmail("test@example.com")
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        assertNotNull(user.getPreferences());
        assertEquals(2000, user.getPreferences().getCalories());
        assertEquals(100.0, user.getPreferences().getBudget());
        assertEquals(3, user.getPreferences().getMeals());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void shouldReturn400WhenCaloriesIsZero() throws Exception {
        UserPreference invalidPreferences = new UserPreference();
        invalidPreferences.setCalories(0);  // Invalid
        invalidPreferences.setBudget(100.0);
        invalidPreferences.setMeals(3);

        mockMvc.perform(post("/api/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPreferences)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void shouldReturn400WhenMealsLessThanTwo() throws Exception {
        UserPreference invalidPreferences = new UserPreference();
        invalidPreferences.setCalories(2000);
        invalidPreferences.setBudget(100.0);
        invalidPreferences.setMeals(1);  // Invalid! Must be > 1

        // When & Then
        mockMvc.perform(post("/api/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPreferences)))
                .andExpect(status().isBadRequest());
    }


    @Test
    @WithMockUser(username = "test@example.com")
    void shouldHandleEdgeCaseBudgetZero() throws Exception {
        UserPreference edgeCasePreferences = new UserPreference();
        edgeCasePreferences.setCalories(2000);
        edgeCasePreferences.setBudget(0.0);  // Invalid!
        edgeCasePreferences.setMeals(3);

        // When & Then
        mockMvc.perform(post("/api/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(edgeCasePreferences)))
                .andExpect(status().isBadRequest());
    }



}