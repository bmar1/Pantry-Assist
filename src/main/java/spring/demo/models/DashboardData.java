package spring.demo.models;

import java.util.List;


public class DashboardData {
    private List<Recipe> selectedMeals;
    private List<Recipe> randomMeals;
    private List<Ingredient> groceryList;
    private Integer progress;
    private Integer budget;

    // Constructor, getters, setters
    public DashboardData(List<Recipe> selectedMeals, List<Recipe> randomMeals, List<Ingredient> groceryList, Integer progress, Integer budget) {
        this.selectedMeals = selectedMeals;
        this.randomMeals = randomMeals;
        this.groceryList = groceryList;
        this.progress = progress;
        this.budget = budget;
    }

    public List<Recipe> getSelectedMeals() { return selectedMeals; }
    public List<Recipe> getRandomMeals() { return randomMeals; }
    public List<Ingredient> getGroceryList() { return groceryList; }
    public Integer getProgress() { return progress; }
    public Integer getBudget() { return budget; }


}