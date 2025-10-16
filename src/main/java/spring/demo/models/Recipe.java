package spring.demo.models;

import java.util.Map;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "recipies")
public class Recipe {

    private String idMeal;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;
    private String category;
    private String area;
    private String instructions;
    private String thumbnail;
    private String tags;
    private String youtube;
    private int calories;
    private int protein;
    private int carbohydrate;
    private int fat;
    private int servingSize;
    @ElementCollection
    @CollectionTable(name = "entity_map", 
                    joinColumns = @JoinColumn(name = "entity_id"))
    @MapKeyColumn(name = "map_key")
    @Column(name = "map_value")
    private Map<String, String> ingredients; // ingredient -> measure

    // getters and setters
    public String getIdMeal() { return idMeal; }
    public void setIdMeal(String idMeal) { this.idMeal = idMeal; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getYoutube() { return youtube; }
    public void setYoutube(String youtube) { this.youtube = youtube; }

    public Map<String, String> getIngredients() { return ingredients; }
    public void setIngredients(Map<String, String> ingredients) { this.ingredients = ingredients; }
	public int getCalories() { return this.calories;}
	public void setCalories(int calories) {this.calories = calories;}
	
	public int getProtein() {return protein;}
	public void setProtein(int protein) {this.protein = protein;}
	
	public int getCarbohydrate() {return carbohydrate;}
	
	public void setCarbohydrate(int carbohydrate) {this.carbohydrate = carbohydrate;}
	
	public int getFat() {return fat;}
	public void setFat(int fat) {this.fat = fat;}
	public int getServingSize() {
		return servingSize;
	}
	public void setServingSize(int servingSize) {
		this.servingSize = servingSize;
	}

    public int extract_weight(String ing){
        return Integer.parseInt(ingredients.get(ing));
    }


    public double sumWeight(){
        double sum = 0;
        for(String ing : ingredients.keySet()){
            sum+= Integer.parseInt(ingredients.get(ing));
        }

        return sum;
    }

    public double parseToGrams(String amountStr) {
        if (amountStr == null) return 0;
        amountStr = amountStr.trim().toLowerCase();

        try {
            if (amountStr.endsWith("g")) {
                return Double.parseDouble(amountStr.replace("g", "").trim());
            } else if (amountStr.endsWith("kg")) {
                return Double.parseDouble(amountStr.replace("kg", "").trim()) * 1000;
            } else if (amountStr.endsWith("ml")) {
                return Double.parseDouble(amountStr.replace("ml", "").trim()); // treat ml ~ g for water-like items
            } else if (amountStr.endsWith("l")) {
                return Double.parseDouble(amountStr.replace("l", "").trim()) * 1000;
            }
        } catch (NumberFormatException e) {
            return 0; // fallback
        }

        return 0;
    }





}