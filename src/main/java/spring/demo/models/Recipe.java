package spring.demo.models;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "recipes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Recipe {

    private String idMeal;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;
    @Column(name = "category")
    private String category;
    private String area;
    @Column(columnDefinition = "TEXT")
    private String instructions;
    private String thumbnail;
    private String tags;
    private String youtube;
    private int calories;
    private int protein;
    private int carbohydrate;
    private int fat;
    private int servingSize;
    @Column(name = "meal_cost")
    private Double mealCost = 0.0;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "recipe_ingredients",
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
        return (int) parseToGrams(ingredients.get(ing));
    }


    public double sumWeight(){
        double sum = 0;
        for(String ing : ingredients.keySet()){
            sum+= (int) parseToGrams(ingredients.get(ing));
        }

        return sum;
    }

    public double parseToTeaspoons(String amountStr) {
        if (amountStr == null || amountStr.trim().isEmpty()) return 0;
        amountStr = amountStr.trim().toLowerCase();

        try {
            // Teaspoons (already normalized)
            if (amountStr.endsWith("tsp") || amountStr.endsWith("teaspoon") || amountStr.endsWith("teaspoons")) {
                String numStr = amountStr.replaceAll("(tsp|teaspoon|teaspoons)", "").trim();
                return Double.parseDouble(numStr);
            }
            // Tablespoons (1 tbsp = 3 tsp)
            else if (amountStr.endsWith("tbs") || amountStr.endsWith("tbsp") ||
                    amountStr.endsWith("tablespoon") || amountStr.endsWith("tablespoons") ||
                    amountStr.endsWith("tblsp")) {
                String numStr = amountStr.replaceAll("(tbs|tbsp|tablespoon|tablespoons|tblsp)", "").trim();
                return Double.parseDouble(numStr) * 3.0;
            }
            // If no recognized unit, try to extract and return just the number
            else {
                String numStr = amountStr.replaceAll("[^0-9.]", "").trim();
                return numStr.isEmpty() ? 0 : Double.parseDouble(numStr);
            }
        } catch (NumberFormatException e) {
            // Fallback: try to extract just the numeric part
            try {
                String numStr = amountStr.replaceAll("[^0-9.]", "").trim();
                return numStr.isEmpty() ? 0 : Double.parseDouble(numStr);
            } catch (NumberFormatException ex) {
                return 0;
            }
        }
    }

    public double parseToMilliliters(String amountStr) {
        if (amountStr == null || amountStr.trim().isEmpty()) return 0;
        amountStr = amountStr.trim().toLowerCase();

        try {
            // Milliliters (already normalized)
            if (amountStr.endsWith("ml") || amountStr.endsWith("milliliter") || amountStr.endsWith("milliliters")) {
                String numStr = amountStr.replaceAll("(ml|milliliter|milliliters)", "").trim();
                return Double.parseDouble(numStr);
            }
            // Liters (1 l = 1000 ml)
            else if (amountStr.endsWith("l") || amountStr.endsWith("liter") ||
                    amountStr.endsWith("liters") || amountStr.endsWith("litre") ||
                    amountStr.endsWith("litres")) {
                String numStr = amountStr.replaceAll("(l|liter|liters|litre|litres)$", "").trim();
                return Double.parseDouble(numStr) * 1000.0;
            }
            // Fluid ounces (1 fl oz = 29.5735 ml)
            else if (amountStr.contains("fl oz") || amountStr.contains("fluid ounce") ||
                    amountStr.contains("fluid ounces")) {
                String numStr = amountStr.replaceAll("(fl oz|fluid ounce|fluid ounces)", "").trim();
                return Double.parseDouble(numStr) * 29.5735;
            }
            // If no recognized unit, try to extract and return just the number
            else {
                String numStr = amountStr.replaceAll("[^0-9.]", "").trim();
                return numStr.isEmpty() ? 0 : Double.parseDouble(numStr);
            }
        } catch (NumberFormatException e) {
            // Fallback: try to extract just the numeric part
            try {
                String numStr = amountStr.replaceAll("[^0-9.]", "").trim();
                return numStr.isEmpty() ? 0 : Double.parseDouble(numStr);
            } catch (NumberFormatException ex) {
                return 0;
            }
        }
    }

    public double parseToGrams(String amountStr) {
        if (amountStr == null || amountStr.trim().isEmpty()) return 0;
        amountStr = amountStr.trim().toLowerCase();

        try {
            // Grams (already normalized)
            if (amountStr.endsWith("g") && !amountStr.endsWith("kg")) {
                String numStr = amountStr.replaceAll("g$", "").trim();
                return Double.parseDouble(numStr);
            }
            // Kilograms (1 kg = 1000 g)
            else if (amountStr.endsWith("kg") || amountStr.endsWith("kilogram") ||
                    amountStr.endsWith("kilograms")) {
                String numStr = amountStr.replaceAll("(kg|kilogram|kilograms)", "").trim();
                return Double.parseDouble(numStr) * 1000.0;
            }
            // Ounces (1 oz = 28.3495 g)
            else if (amountStr.endsWith("oz") || amountStr.endsWith("ounce") ||
                    amountStr.endsWith("ounces")) {
                String numStr = amountStr.replaceAll("(oz|ounce|ounces)", "").trim();
                return Double.parseDouble(numStr) * 28.3495;
            }
            // Pounds (1 lb = 453.592 g)
            else if (amountStr.endsWith("lb") || amountStr.endsWith("lbs") ||
                    amountStr.endsWith("pound") || amountStr.endsWith("pounds")) {
                String numStr = amountStr.replaceAll("(lb|lbs|pound|pounds)", "").trim();
                return Double.parseDouble(numStr) * 453.592;
            }
            // If no recognized unit, try to extract and return just the number
            else {
                String numStr = amountStr.replaceAll("[^0-9.]", "").trim();
                return numStr.isEmpty() ? 0 : Double.parseDouble(numStr);
            }
        } catch (NumberFormatException e) {
            // Fallback: try to extract just the numeric part
            try {
                String numStr = amountStr.replaceAll("[^0-9.]", "").trim();
                return numStr.isEmpty() ? 0 : Double.parseDouble(numStr);
            } catch (NumberFormatException ex) {
                return 0;
            }
        }
    }





}