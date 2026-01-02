package spring.demo.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;


@Entity
@Table(
        name = "user_meal_plans",
        indexes = {
                @Index(name = "idx_ump_user_id", columnList = "user_id"),
                @Index(name = "idx_ump_recipe_id", columnList = "recipe_id"),
                @Index(name = "idx_ump_planned", columnList = "planned"),
                @Index(name = "idx_ump_eaten", columnList = "eaten"),
                @Index(name = "idx_ump_user_planned", columnList = "user_id, planned"),
                @Index(name = "idx_ump_user_eaten", columnList = "user_id, eaten"),
                @Index(name = "idx_ump_user_recipe", columnList = "user_id, recipe_id")
        }
)
public class UserMealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "eaten")
    private Boolean eaten = false;
    @Column(name = "planned")
    private Boolean planned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "eaten_date")
    private LocalDate eatenDate;

    public UserMealPlan() {
    }

    public UserMealPlan(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
    }

    public LocalDate getEatenDate() {
        return eatenDate;
    }

    public void setEatenDate(LocalDate eatenDate) {
        this.eatenDate = eatenDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Boolean isEaten() {
        return eaten;
    }

    public void setEaten(boolean eaten) {
        this.eaten = eaten;
    }

    public Boolean isPlanned() {
        return planned;
    }

    public void setPlanned(boolean planned) {
        this.planned = planned;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }


}