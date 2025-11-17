package spring.demo.models; // adjust package as needed

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_meal_plans")
public class UserMealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "eaten")
    private Boolean eaten;
    @Column(name = "planned")
    private Boolean planned;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    // Constructors
    public UserMealPlan() {}

    public UserMealPlan(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
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