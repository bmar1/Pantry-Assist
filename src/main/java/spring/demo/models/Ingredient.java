package spring.demo.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Setter;

@Setter
@Entity
@Table(name = "ingredients")
public class Ingredient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	private Double calories;
	private Double protein;
    private String category;
	private Double carbs;
	private Double fat;
	private Double fiber;
	private Double sugar;
	private String url;
	
	private double totalPrice;
	//how many in box
	private String totalServings;

	
	
	public String getUrl() {
		return url;
	}

    public double getTotalPrice() {
		return totalPrice;
	}


    // Per 100g serving
	private String servingDescription;

	// Constructors
	public Ingredient() {

	}

	public Ingredient(String name) {
		this.name = name;
	}

	public Long getId() {
		return id;
	}

    public String getName() {
		return name;
	}


    public String getTotalServings() {
		return totalServings;
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

    public Double getFiber() {
		return fiber;
	}

    public Double getSugar() {
		return sugar;
	}

    public String getServingDescription() {
		return servingDescription;
	}


}
