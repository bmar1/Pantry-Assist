
/**
 * @file Dashboard.js
 * @description This component serves as the main dashboard for the user after logging in.
 * It displays personalized meal suggestions, a preview of the grocery list, potential meal ideas,
 * and some brief analytics. It fetches all necessary data from the backend API and handles
 * navigation to other parts of the application like recipe details and the full grocery list.
 */

import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import OnboardingCard from "../components/OnboardCard";
import Settings from "../components/Settings";
import SettingsOnboard from "../components/SettingsOnboard";
import Nav from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(
    () =>
      localStorage.getItem("onboarding") === "true"
  );

  const [isNavVisible, setIsNavVisible] = useState(false);
  const [meals, setMeals] = useState([]);
  const [mealPreview, setMealPreview] = useState([]);
  const [recipe, setRecipe] = useState([]);
  const [grocery, setGrocery] = useState([]);
  const [groceryPreview, setGroceryPreview] = useState([]);
  const [isGroceryLoading, setIsGroceryLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [progress, setProgress] = useState(40);
  const [groupSize, setGroupSize] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [shouldNavigate, setShouldNavigate] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };


  useEffect(() => {
    loadDashboardData();
  }, []);


  useEffect(() => {
    if (shouldNavigate && grocery) {
      navigate('/grocery', { state: { grocery: grocery } });
      setShouldNavigate(false);
    }
  }, [grocery, shouldNavigate, navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/initial-data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Unpack the consolidated response
        setMeals(data.selectedMeals);
        setRecipe(data.selectedMeals);
        setMealPreview(data.randomMeals);
        setGrocery(data.groceryList);
        setGroceryPreview(data.groceryList.slice(0, 3));
      } else {
        console.error("Failed to load dashboard data:", response.status);

        setMeals([]);
        setRecipe([]);
        setMealPreview([]);
        setGrocery([]);
        setGroceryPreview([]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setMeals([]);
      setRecipe([]);
      setMealPreview([]);
      setGrocery([]);
      setGroceryPreview([]);
    }
  };



  const handleRecipeClick = (recipeName) => {
    navigate("/recipe", { state: { name: recipeName } });
  };
  const handlePotential = (recipeName) => {
    navigate("/all-meals");
  };

  const handleGroceryClick = () => {
    if (grocery.length > 0) {
      setShouldNavigate(true);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <Nav
        isNavVisible={isNavVisible}
        setIsNavVisible={setIsNavVisible}
        setShowSettings={setShowSettings}
        handleLogout={handleLogout}
        progress={progress}
      />


      <main className={`p-8 transition-all duration-300 ${isNavVisible ? 'ml-60' : 'ml-52'}`}>
        {showOnboarding && <OnboardingCard setShowOnboarding={setShowOnboarding} />}
        {showSettings && <Settings setShowSettings={setShowSettings} setShowPreferences={setShowPreferences} />}
        {showPreferences && <SettingsOnboard setShowPreferences={setShowPreferences} />}

        <div className="flex flex-col md:flex-row gap-10 md:gap-20 mt-5 ml-5">
          {/* Render meal suggestions based on data, rendered conditionally*/}
          <div
            className="bg-[#fdfcf5] p-8 rounded-xl shadow-lg hover:shadow-2xl h-[600px] flex flex-col w-full md:w-3/5 md:mr-16"
          >

            {meals.length > 0 && (
              <>
                <div className="mb-4 ml-4">
                  <h1 className="text-5xl text-[#628d45] font-bold mb-2">Today's Suggestions:</h1>
                  <h2 className="text-2xl text-[#334924] font-semibold">{meals[currentIndex].name}</h2>
                </div>

                <div className="flex-grow flex flex-col justify-center gap-4 ml-4">
                  <div className="w-[95%] h-80 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <img
                      onClick={() => handleRecipeClick(meals[currentIndex].name)}
                      src={meals[currentIndex].thumbnail}
                      alt={meals[currentIndex].name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex justify-center space-x-3">
                    {meals.slice(0, 4).map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(i);
                        }}
                        className={`w-3 h-3 rounded-full bg-[#628d45] ${currentIndex === i ? 'opacity-100' : 'opacity-50'} hover:opacity-100 transition-opacity`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mini Widgets Container */}
          <div className="flex flex-col gap-6 w-[400px]">
            {/* Grocery List Preview */}
            <div
              onClick={handleGroceryClick}
              className="p-8 rounded-xl shadow-lg hover:shadow-2xl bg-[#a4d1d4] hover:bg-[#b6e8eb] transition-all duration-300 cursor-pointer"
              style={{ height: '250px' }}
            >
              <h2 className="font-bold mb-6 text-center text-2xl text-black">Grocery List</h2>
              {isGroceryLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-600 text-base">Loading...</p>
                </div>
              ) : grocery.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-600 text-base">Your list is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groceryPreview.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-base">
                      <div className="flex items-center">
                        <img src={item.imageUrl || '/icons/groceryIcon.png'} alt={item.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                        <span className="text-black font-medium">{item.name}</span>
                      </div>
                      <span className="font-semibold text-black">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Potential Meals */}
            <div onClick={handlePotential} className="bg-[#a4d1d4] hover:bg-[#b6e8eb] p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300" style={{ height: '300px' }}>
              <h2 className="font-bold mb-6 text-2xl text-black text-center">Potential Meals</h2>
              <div className="flex flex-col gap-4 items-center">
                {mealPreview.slice(0, 1).map((meal, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <img
                      src={meal.thumbnail}
                      alt={meal.name}
                      className="w-32 h-32 object-cover rounded-lg shadow-md mb-3"
                    />
                    <p className="text-lg font-bold text-black text-center">{meal.name}</p>
                    <p className="text-base text-gray-700 font-medium">{meal.calories} cal</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brief Analytics */}
            <div className="bg-[#a4d1d4] p-8 rounded-xl shadow-lg hover:shadow-2xl hover:bg-[#b6e8eb] transition-all duration-300 flex flex-col justify-center" style={{ height: '200px' }}>
              <h2 className="font-bold mb-6 text-center text-2xl text-black">Money Saved</h2>
              <p className="text-center text-5xl font-bold text-black">$25</p>
              <p className="text-center text-lg text-gray-700 mt-2">This Week</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



