import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewMealPlanShowcase = ({ meals, onClose }) => {
  const navigate = useNavigate();
  const displayMeals = meals.slice(0, 3);

  const onMealClick = (recipeName) => {
    navigate('/recipe', { state: { name: recipeName } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-700 transition-all hover:rotate-90 duration-300"
          aria-label="Close"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-block bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white px-3 py-1 rounded-full text-xs font-semibold mb-2 sm:mb-3">
            NEW MEAL PLAN
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Your Fresh Selections</h2>
          <p className="text-base sm:text-lg text-gray-500">Delicious meals ready for you to cook</p>
        </div>

        {/* Meals Grid - Adjusts based on number of meals */}
        <div
          className={`grid gap-4 sm:gap-6 ${
            displayMeals.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {displayMeals.map((meal, index) => (
            <div
              key={meal.id || index}
              onClick={() => onMealClick(meal.name)}
              className="group bg-white rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100 hover:border-[#6d9851]"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={meal.thumbnail}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* meal number badge */}
                <div className="absolute top-3 right-3 bg-[#6d9851] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  #{index + 1}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#6d9851] transition-colors line-clamp-2">
                  {meal.name}
                </h3>

                <div className="flex items-center gap-2 text-sm mb-3">
                  {meal.calories && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">{meal.calories} cal</span>
                    </div>
                  )}

                  {meal.category && (
                    <div className="inline-block bg-gradient-to-r from-[#6d9851]/10 to-[#5A7A4D]/10 text-[#5A7A4D] px-3 py-1 rounded-lg text-xs font-semibold border border-[#6d9851]/20">
                      {meal.category}
                    </div>
                  )}
                </div>

                {/* View Recipe Arrow */}
                <div className="mt-4 flex items-center text-[#6d9851] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  View Recipe
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Cooking!
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMealPlanShowcase;
