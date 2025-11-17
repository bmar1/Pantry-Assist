package spring.demo.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    Optional<Recipe> findByNameIgnoreCase(String name);
    List<Recipe> findByCaloriesBetween(int min, int max);
    @Query(value = "SELECT * FROM Recipe  " +
            "WHERE calories BETWEEN :minCal AND :maxCal " +
            "ORDER BY ABS(calories - :target) ASC " +
            "LIMIT 1",
            nativeQuery = true)
    Recipe findClosestToCalorieTarget(@Param("minCal") int minCal,
                                      @Param("maxCal") int maxCal,
                                      @Param("target") int target);

    @Query(value = "SELECT * FROM recipes ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Recipe> findRandomRecipes(@Param("limit") int limit);
    @Query(value = "SELECT * From recipes WHERE category = :userCategory", nativeQuery = true)
    List<Recipe> findByCategory(String userCategory);
    @Query("SELECT ump.recipe FROM UserMealPlan ump WHERE ump.user.id = :userId")
    List<Recipe> findRecipesByUserId(@Param("userId") Long userId);

    @Query("SELECT ump.recipe FROM UserMealPlan ump WHERE ump.user.id = :userId AND ump.planned = true")
    List<Recipe> findMarkedRecipesByUserId(@Param("userId") Long userId);



}
