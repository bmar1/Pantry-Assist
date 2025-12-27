/**
 * @file Recipepage.jsx
 * @description This page/component handles the main responsive design towards:
 * planning & cooking meals, eating meals and updating meals,
 * it incorporates the list, a helpful guide, and steps laid out upon completion, giving a message.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';

const RecipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = location.state || {};
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepCompleted, setStepCompleted] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [mealEaten, setMealEaten] = useState(false);

  //updates backend to mark meal as eaten
  const markMealAsEaten = async () => {
    try {
      const token = localStorage.getItem('token');

      const url = `api/meals/updateMeal?name=${encodeURIComponent(name)}`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log(`Meal '${name}' marked as eaten.`);
      } else {
        console.error('Failed to mark meal as eaten:', response.status);
      }
    } catch (error) {
      console.error('Error marking meal as eaten:', error);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const loadMeal = async () => {
      if (!name) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const encodedName = encodeURIComponent(name);
        const response = await fetch(`http://localhost:8080/api/meal?name=${encodedName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRecipe(Array.isArray(data) ? data[0] : data);
        } else {
          console.error('Failed to load meal:', response.status);
          setRecipe(null);
        }
      } catch (error) {
        console.error('Error loading meal:', error);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    loadMeal();
  }, [name]);

  //memoize the steps and filter based on new line for each new step
  const steps = useMemo(() => {
    if (!recipe?.instructions) return [];
    return recipe.instructions
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .split(/\n+/)
      .filter((step) => step.trim() !== '');
  }, [recipe?.instructions]);

  //update completion based on steps completed
  const completionPercentage =
    steps.length > 0 ? Math.round((stepCompleted.filter(Boolean).length / steps.length) * 100) : 0;

  const allStepsCompleted =
    steps.length > 0 && stepCompleted.filter(Boolean).length === steps.length;

  // Initialize stepCompleted only when steps change
  useEffect(() => {
    if (steps && steps.length > 0) {
      setStepCompleted(new Array(steps.length).fill(false));
    }
  }, [steps]);

  // Check if all steps are completed
  useEffect(() => {
    // Only run if we have steps and stepCompleted is initialized
    if (stepCompleted.length > 0 && steps.length > 0) {
      const allCompleted = stepCompleted.every(Boolean);

      if (allCompleted && !mealEaten) {
        // Only trigger if not already eaten
        setShowPopup(true);
        setMealEaten(true);

        const timer = setTimeout(() => {
          setShowPopup(false);
        }, 4000);

        return () => clearTimeout(timer);
      }
    }
  }, [stepCompleted, steps.length, mealEaten]);

  // Call API when meal is marked as eaten
  useEffect(() => {
    const markMeal = async () => {
      if (mealEaten && name) {
        try {
          await markMealAsEaten();
        } catch (error) {
          console.error('Failed to mark meal as eaten:', error);
        }
      }
    };

    markMeal();
  }, [mealEaten, name]);

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1];
    const ampersandPosition = videoId?.indexOf('&');
    if (ampersandPosition !== -1) {
      return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(recipe?.youtube);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3f783f] flex justify-center items-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#3f783f] flex justify-center items-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No recipe data found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#668B67]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d9851] via-[#5A7A4D] to-[#4a6340] flex justify-center items-start">
      {/* Success Popup */}
      {showPopup && (
        <div className="mr-15 fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white px-8 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <p className="font-semibold">Congratulations on completing your meal!</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full mx-4 my-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          {/* display badge and percentage */}
          {steps.length > 0 && (
            <div className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {completionPercentage}%
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Progress</div>
                  <div className="text-xs opacity-75">
                    {stepCompleted.filter(Boolean).length}/{steps.length} steps
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Hero Section with Image */}
          {recipe.thumbnail && (
            <div className="relative h-96 group overflow-hidden">
              <img
                src={recipe.thumbnail}
                alt={recipe.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                  {recipe.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/25 backdrop-blur-lg text-white rounded-full text-sm font-semibold border border-white/30 shadow-lg">
                    {recipe.category}
                  </span>
                  <span className="px-4 py-2 bg-white/25 backdrop-blur-lg text-white rounded-full text-sm font-semibold border border-white/30 shadow-lg">
                    {recipe.area}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Nutritional Info Cards */}
            {(recipe.calories > 0 ||
              recipe.protein > 0 ||
              recipe.carbohydrate > 0 ||
              recipe.fat > 0) && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-3xl"></span>
                  Nutrition Facts
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recipe.calories > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="text-orange-600 text-2xl mb-2"></div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Calories</p>
                      <p className="text-3xl font-bold text-orange-700">{recipe.calories}</p>
                      <p className="text-xs text-gray-500 mt-1">kcal</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ingredients Section */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-3xl"></span>
                  Ingredients
                </h2>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                  <ul className="space-y-3">
                    {recipe.ingredients &&
                      Object.entries(recipe.ingredients).map(([ingredient, measure], index) => (
                        <li
                          key={index}
                          className="flex items-start p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6d9851] text-white flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 flex-1">
                            <span className="font-bold text-[#5A7A4D]">{measure}</span>
                            <span className="mx-1">•</span>
                            <span>{ingredient}</span>
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Instructions Section */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-3xl"></span>
                  Cooking Steps
                </h2>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`group relative rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
                        stepCompleted[index]
                          ? 'bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] shadow-lg'
                          : 'bg-white border-2 border-gray-200 hover:border-[#6d9851] hover:shadow-md'
                      }`}
                      onClick={() => {
                        const newStepCompleted = [...stepCompleted];
                        //add new step completed
                        newStepCompleted[index] = !newStepCompleted[index];
                        setStepCompleted(newStepCompleted);
                        // if all steps completed, show poup
                        if (
                          !stepCompleted[index] &&
                          newStepCompleted.filter(Boolean).length === steps.length
                        ) {
                          setShowPopup(true);
                          setTimeout(() => setShowPopup(false), 4000);
                        }
                      }}
                    >
                      <div className="flex items-start p-5">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 font-bold text-lg transition-all duration-300 ${
                            stepCompleted[index]
                              ? 'bg-white text-[#6d9851] shadow-lg'
                              : 'bg-gradient-to-br from-[#6d9851] to-[#5A7A4D] text-white'
                          }`}
                        >
                          {stepCompleted[index] ? '✓' : index + 1}
                        </div>
                        <div
                          className={`flex-1 ${stepCompleted[index] ? 'text-white' : 'text-gray-700'}`}
                        >
                          <p
                            className={`leading-relaxed ${stepCompleted[index] ? 'line-through opacity-90' : ''}`}
                          >
                            {step}
                          </p>
                        </div>
                      </div>

                      {/* Completion indicator */}
                      {stepCompleted[index] && (
                        <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                          Completed
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Complete All Button */}
                {!allStepsCompleted && steps.length > 0 && (
                  <button
                    //completes all steps and shows popups
                    onClick={() => {
                      setStepCompleted(steps.map(() => true));
                      setShowPopup(true);
                      setTimeout(() => setShowPopup(false), 4000);
                    }}
                    className="mt-6 w-full py-4 bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    Mark All Steps as Complete
                  </button>
                )}
              </div>
            </div>

            {/* Video Tutorial */}
            {embedUrl && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <span className="text-3xl"></span>
                  Video Tutorial
                </h2>
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100">
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
