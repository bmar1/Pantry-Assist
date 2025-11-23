package spring.demo.models.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.demo.models.Ingredient;

import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Optional<Ingredient> findByNameIgnoreCase(String name);
}
