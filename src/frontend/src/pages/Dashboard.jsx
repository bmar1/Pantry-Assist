/**
 * @file Dashboard.js
 * @description This component serves as the main dashboard for the user after logging in.
 * It displays personalized meal suggestions, a preview of the grocery list, potential meal ideas,
 * and some brief analytics. It fetches all necessary data from the backend API and handles
 * navigation to other parts of the application like recipe details and the full grocery list.
 */

import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import React, { useState, useEffect } from 'react';
import OnboardingCard from '../components/OnboardCard';
import Settings from '../components/Settings';
import SettingsOnboard from '../components/SettingsOnboard';
import Nav from '../components/Navbar';
import NewMealPlanShowcase from '../components/NewMealShowcase';
import LoadingScreen from './LoadingScreen';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  //states
  const [isNavVisible, setIsNavVisible] = useState(false);
  const previousMealIdsRef = useRef(null);
  const [meals, setMeals] = useState([]);
  const [showNewMealPlan, setShowNewMealPlan] = useState(false);
  const [mealPreview, setMealPreview] = useState([]);
  const [grocery, setGrocery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groceryPreview, setGroceryPreview] = useState([]);
  const [isGroceryLoading, setIsGroceryLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  //nav
  const [eaten, setEaten] = useState(0);
  const [target, setTarget] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [budget, setBudget] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleRecipeClick = (recipeName) => {
    navigate('/recipe', { state: { name: recipeName } });
  };
  const handlePotential = () => {
    navigate('/all-meals');
  };

  const handleGroceryClick = () => {
    if (grocery.length > 0) {
      setShouldNavigate(true);
    }
  };

  useEffect(() => {
    const onboardingStatus = localStorage.getItem('onboarding');
    if (onboardingStatus === 'true') {
      setShowOnboarding(true);
      setIsInitialLoad(false);
    } else {
      setShowOnboarding(false);
      // Load data on initial mount if onboarding is complete
      if (isInitialLoad) {
        loadDashboardData();
        setIsInitialLoad(false);
      }
    }
  }, []);

  useEffect(() => {
    // Only load if:
    // 1. Not showing onboarding
    // 2. Not showing loading screen
    // 3. Data is empty (hasn't been loaded yet)
    const stored = localStorage.getItem('previousMealNames');
    if (stored) {
      previousMealIdsRef.current = stored;
    }
    if (!showOnboarding && !isLoading && grocery.length === 0 && meals.length === 0) {
      loadDashboardData();
    }
  }, [showOnboarding, isLoading]);

  //navigate to the grocery page when needed
  useEffect(() => {
    if (shouldNavigate && grocery) {
      navigate('/grocery', { state: { grocery: grocery } });
      setShouldNavigate(false);
    }
  }, [grocery, shouldNavigate, navigate]);

  //loads all relevant data to page
  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/load`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        console.error('Failed to load dashboard data:', response.status);
        setMeals([]);
        setMealPreview([]);
        setGrocery([]);
        setGroceryPreview([]);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const currentMealNames = data.selectedMeals
        .map((meal) => meal.name)
        .sort()
        .join('|');

      if (previousMealIdsRef.current !== null) {
        const hasDifference = previousMealIdsRef.current !== currentMealNames;
        if (hasDifference) {
          setShowNewMealPlan(true);
        }
      }

      previousMealIdsRef.current = currentMealNames;
      localStorage.setItem('previousMealNames', currentMealNames);

      setMeals(data.selectedMeals);
      setRemaining(data.remaining);
      setBudget(data.budget);
      setTarget(data.target);
      setEaten(data.eaten);
      setProgress(data.progress);
      setBudget(data.budget);
      setMealPreview(data.randomMeals);
      const getNormalizedWords = (name) => {
        if (!name) return [];
        return name
          .toLowerCase()
          .trim()
          .replace(/[^a-z\s]/g, '')
          .split(/\s+/)
          .filter((word) => word.length > 2)
          .map((word) => word.replace(/s$/, '').replace(/es$/, ''));
      };

      // Helper function to calculate similarity between two items
      const getSimilarityScore = (name1, name2) => {
        const words1 = getNormalizedWords(name1);
        const words2 = getNormalizedWords(name2);

        if (words1.length === 0 || words2.length === 0) return 0;

        const matches = words1.filter((word) => words2.includes(word)).length;
        const totalWords = Math.max(words1.length, words2.length);

        return matches / totalWords;
      };

      const filteredList = [];
      const seenItems = [];

      data.groceryList.forEach((item) => {
        if (!item || !item.name || item.name.toLowerCase() === 'null') {
          return; // Skip invalid items
        }

        const normalizedName = item.name.toLowerCase().trim();

        // Check if this item is similar to any already seen item
        const isSimilar = seenItems.some((seenItem) => {
          const similarity = getSimilarityScore(normalizedName, seenItem.name);
          // If 50% or more words match, consider it a duplicate
          return similarity >= 0.5;
        });

        if (!isSimilar) {
          filteredList.push(item);
          seenItems.push({ name: normalizedName, original: item });
        }
      });

      console.log(
        `Fuzzy filtered grocery list: ${data.groceryList.length} -> ${filteredList.length} items`
      );

      setGrocery(filteredList);
      setIsGroceryLoading(false);
      setGroceryPreview(data.groceryList.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setMeals([]);
      setMealPreview([]);
      setProgress(0);
      setGrocery([]);
      setGroceryPreview([]);
    } finally {
      // Keep loading screen for minimum time
      setTimeout(() => {
        setIsLoading(false);
      }, 5500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* display components on top*/}
      {isLoading && <LoadingScreen />}
      <Nav
        isNavVisible={isNavVisible}
        setIsNavVisible={setIsNavVisible}
        setShowSettings={setShowSettings}
        handleLogout={handleLogout}
        progress={progress}
        caloriesEaten={eaten}
        caloriesTarget={target}
        caloriesRemaining={remaining}
      />

      <main className={`p-8 transition-all duration-300 ${isNavVisible ? 'ml-60' : 'ml-20'}`}>
        {showNewMealPlan && (
          <NewMealPlanShowcase meals={meals} onClose={() => setShowNewMealPlan(false)} />
        )}
        {showOnboarding && (
          <OnboardingCard setShowOnboarding={setShowOnboarding} setShowLoading={setIsLoading} />
        )}
        {showSettings && (
          <Settings setShowSettings={setShowSettings} setShowPreferences={setShowPreferences} />
        )}
        {showPreferences && <SettingsOnboard setShowPreferences={setShowPreferences} />}

        <div className={`flex flex-col lg:flex-row gap-8 mt-5 max-w-7xl mx-auto`}>
          {/* Main Suggestion Card */}
          <div className="relative overflow-hidden bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col w-full lg:w-2/3">
            {meals.length > 0 && (
              <>
                <div className="mb-8 ml">
                  <span className="px-4 py-1.5 bg-[#628d45]/10 text-[#628d45] rounded-full text-sm font-bold tracking-wide uppercase">
                    {meals[currentIndex].category || 'Main Dish'}
                  </span>
                  <h1 className="text-5xl text-[#1a2e05] font-black tracking-tighter mt-4 mb-2">
                    Today's Suggestion
                  </h1>
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl text-[#628d45] font-medium italic">
                      {meals[currentIndex].name}
                    </h2>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 font-medium">
                      {meals[currentIndex].calories} kcal
                    </span>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-center relative">
                  <div
                    onClick={() => handleRecipeClick(meals[currentIndex].name)}
                    className="group relative w-full h-96 rounded-[2rem] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={meals[currentIndex].thumbnail}
                      alt={meals[currentIndex].name}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white/90 px-6 py-3 rounded-full font-bold text-[#628d45] shadow-lg">
                        View Recipe
                      </span>
                    </div>
                  </div>

                  {/* control dots */}
                  <div className="flex justify-center space-x-3 mt-8">
                    {meals.slice(0, 4).map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(i);
                        }}
                        className={`h-2 transition-all duration-300 rounded-full ${
                          currentIndex === i
                            ? 'w-8 bg-[#628d45]'
                            : 'w-2 bg-gray-200 hover:bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Container */}
          <div className="flex flex-col gap-6 w-full lg:w-[380px]">
            <div
              onClick={handleGroceryClick}
              className="group p-8 rounded-[2rem] bg-[#f7f2e1] border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl text-[#68551c]">Grocery List</h2>
                <span className="text-xs font-bold text-[#b0a384] bg-gray-200 px-2 py-1 rounded-md">
                  {grocery.length} items
                </span>
              </div>

              {isGroceryLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-pulse text-gray-400">Loading...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {groceryPreview.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.imageUrl || '/icons/groceryIcon.png'}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="ml-3 text-sm font-semibold text-[#68551c]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold pr-2 text-[#b0a384]">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* show potential meals */}
            <div
              onClick={handlePotential}
              className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <h2 className="font-bold mb-6 text-xl text-gray-800">Next Up</h2>
              {mealPreview.slice(0, 1).map((meal, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img
                    src={meal.thumbnail}
                    className="w-20 h-20 object-cover rounded-2xl shadow-sm group-hover:rotate-3 transition-transform"
                  />
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{meal.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#628d45] bg-[#628d45]/10 px-2 py-0.5 rounded">
                        {meal.calories} Cal
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {meal.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics - High Contrast Sleek */}
            <div className="bg-[#1a2e05] p-8 rounded-[2rem] shadow-lg flex flex-col justify-center text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#628d45] rounded-full blur-3xl opacity-40"></div>
              <h2 className="text-gray-400 font-medium text-sm uppercase tracking-widest mb-2">
                Savings
              </h2>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black">${95 - budget}</span>
                <span className="text-[#628d45] font-bold">.00</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Automatically saved this week</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
