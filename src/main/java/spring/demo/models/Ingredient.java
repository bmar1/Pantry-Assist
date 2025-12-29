package spring.demo.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(
        name = "ingredients",
        indexes = {
                @Index(name = "idx_ingredient_name", columnList = "name"),
                @Index(name = "idx_ingredient_price", columnList = "totalPrice")
        }
)
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    @Column(nullable = true)
    private Double calories;
    @Column(nullable = true)
    private Double protein;
    private String category;
    @Column(nullable = true)
    private Double carbs;
    @Column(nullable = true)
    private Double fat;
    private String productUrl;
    private String imageUrl;

    private Double totalPrice;
    //how many in box
    private String servingSize;
    private String servingsPerContainer; //servings in container

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "cache_expires_at")
    private LocalDateTime cacheExpiresAt;

    //Save and update before persisting
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        cacheExpiresAt = LocalDateTime.now().plusDays(14);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        cacheExpiresAt = LocalDateTime.now().plusDays(14); // Reset TTL on update
    }

    public boolean isCacheValid() {
        return cacheExpiresAt != null && LocalDateTime.now().isBefore(cacheExpiresAt);
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    // Per 100g serving
    private String servingDescription;

    public Ingredient(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getServingSize() {
        return servingSize;
    }

    public Double getCalories() {
        return calories;
    }

    public Double getProtein() {
        return protein;
    }

    public Double getCarbs() {
        return carbs;
    }

    public Double getFat() {
        return fat;
    }

    public String getServingDescription() {
        return servingDescription;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServingsPerContainer() {
        return servingsPerContainer;
    }

    public void setPrice(double v) {
        this.totalPrice = v;
    }
}
