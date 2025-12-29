package spring.demo.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import spring.demo.models.User;
import spring.demo.models.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import spring.demo.service.MealPlanService;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc

class UnitTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
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

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));

        // When
        int progress = mealPlanService.getProgress(testUser);

        // Then
        assertEquals(0, progress);
    }



}

