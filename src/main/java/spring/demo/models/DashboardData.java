package spring.demo.models;

import java.util.List;


public class DashboardData {
    private List<Recipe> selectedMeals;
    private List<Recipe> randomMeals;
    private List<Ingredient> groceryList;

    // Constructor, getters, setters
    public DashboardData(List<Recipe> selectedMeals, List<Recipe> randomMeals, List<Ingredient> groceryList) {
        this.selectedMeals = selectedMeals;
        this.randomMeals = randomMeals;
        this.groceryList = groceryList;
    }

    public List<Recipe> getSelectedMeals() { return selectedMeals; }
    public List<Recipe> getRandomMeals() { return randomMeals; }
    public List<Ingredient> getGroceryList() { return groceryList; }


}