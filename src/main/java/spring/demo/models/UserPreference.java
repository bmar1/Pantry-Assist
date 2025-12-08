package spring.demo.models;

import lombok.Data;

import jakarta.persistence.Embeddable;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class UserPreference {

	private Integer calories;
	private Double budget;
	private Integer meals;
	private Boolean vegan;
	private String allergies;
    private boolean update;
	public int getCalories() {
		return calories;
	}
	public void setCalories(Integer calories) {
		this.calories = calories;
	}
	public double getBudget() {
		return budget;
	}
	public void setBudget(Double budget) {
		this.budget = budget;
	}
	public Integer getMeals() {
		return meals;
	}
	public void setMeals(int meals) {
		this.meals = meals;
	}
	public Boolean isVegan() {
		return vegan;
	}
	public void setVegan(Boolean vegan) {
		this.vegan = vegan;
	}
	public String getAllergies() {
		return allergies;
	}
	public void setAllergies(String allergies) {
		this.allergies = allergies;
	}

    public Boolean isUpdate(){
        return update;
    }


	
	
	
	
	
}
