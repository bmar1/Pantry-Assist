/**
 * @file OnboardCard.jsx
 * @description This component renders a multi-step onboarding form for new users.
 * It collects information about their dietary preferences, budget, and calorie goals.
 * The form is presented as a modal and uses framer-motion for smooth transitions
 * between steps.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingCard = ({ setShowOnboarding, setShowLoading }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    calories: 2000,
    budget: 50,
    meals: 2,
    allergies: '',
    update: false
  });

  const totalSteps = 4;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setShowOnboarding(false);
    setShowLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      localStorage.setItem('pref', JSON.stringify(formData));
      localStorage.removeItem('onboarding');

      if (res.ok) {
        const data = await res.json();
        console.table(data);

        // Wait for loading animation, then trigger data load
        setTimeout(() => {
          setShowLoading(false);
          // Data will load automatically via useEffect when showLoading becomes false
        }, 5500);
      } else {
        setShowLoading(false);
        alert('Failed to submit onboarding data');
      }
    } catch (err) {
      console.error(err);
      setShowLoading(false);
      alert('Error submitting onboarding data');
    }
  };

  const caloriePercentage = ((formData.calories - 1400) / (3000 - 1400)) * 100;
  const budgetPercentage = ((formData.budget - 20) / (150 - 20)) * 100;

  return (
    <div className="min-h-screen fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <style>
        {`
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #A8C995; /* Light Green */
            cursor: pointer;
            border-radius: 50%;
          }

          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #A8C995; /* Light Green */
            cursor: pointer;
            border-radius: 50%;
          }
        `}
      </style>
      <div className="bg-[#628d45] rounded-2xl shadow-2xl p-8 max-w-lg  w-full relative">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8">
          Let's personalize your meal plan!
        </h1>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="bg-white rounded-xl p-6 mb-6">
                <p className="text-slate-800 text-xl font-semibold mb-4">
                  Welcome! Help us create your perfect meal plan
                </p>
                <p className="text-slate-600 text-sm">
                  This will only take a minute and helps us recommend recipes you'll love!
                </p>{' '}
              </div>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-lg bg-[#A8C995] text-slate-800 font-bold hover:bg-[#94BF7F] hover:scale-105 transition-all shadow-lg"
              >
                Get Started →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="bg-white rounded-xl p-6">
                {/* Progress bar with label */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-slate-600">
                      Step {step} of {totalSteps}
                    </p>
                    <p className="text-sm text-slate-600">
                      {Math.round((step / totalSteps) * 100)}%
                    </p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#A8C995] rounded-full"
                      initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                      animate={{ width: `${(step / totalSteps) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-slate-800">Daily Calorie Target</h2>
                    <p className="text-slate-600 text-sm mb-4">
                      We'll recommend recipes that fit your goals
                    </p>

                    {/* Quick presets */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: ' Cut', value: 1500 },
                        { label: ' Maintain', value: 2000 },
                        { label: ' Bulk', value: 2500 }
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setFormData({ ...formData, calories: preset.value })}
                          className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                            formData.calories == preset.value
                              ? 'bg-[#A8C995] text-slate-800'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {preset.label}
                          <div className="text-xs opacity-70">{preset.value}</div>
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <input
                        type="range"
                        min="1400"
                        max="3000"
                        step="100"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                        style={{ background: `linear-gradient(to right, #A8C995 ${caloriePercentage}%, #e2e8f0 ${caloriePercentage}%, #e2e8f0 100%)` }}
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>1400</span>
                        <span>3000</span>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-3xl font-bold text-slate-800">{formData.calories}</p>
                      <p className="text-slate-600 text-sm">calories per day</p>
                    </div>

                    <div className="mt-3 bg-slate-100 rounded-lg p-3 text-xs text-slate-600">
                      Most adults need 1800-2500 calories/day
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-slate-800">Weekly Budget </h2>
                    <p className="text-slate-600 text-sm mb-4">
                      We'll find recipes that fit your budget
                    </p>

                    {/* Quick presets */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[20, 40, 60, 80].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setFormData({ ...formData, budget: preset })}
                          className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                            formData.budget == preset
                              ? 'bg-[#A8C995] text-slate-800'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                      style={{ background: `linear-gradient(to right, #A8C995 ${budgetPercentage}%, #e2e8f0 ${budgetPercentage}%, #e2e8f0 100%)` }}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>$20</span>
                      <span>$150</span>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-3xl font-bold text-slate-800">${formData.budget}</p>
                      <p className="text-slate-600 text-sm">per week</p>
                    </div>

                    <div className="mt-3 bg-slate-100 rounded-lg p-3 text-xs text-slate-600">
                      Average weekly grocery budget is $50-80 per person
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-slate-800">Meals per Day</h2>
                    <p className="text-slate-600 text-sm mb-6">How many main meals do you eat?</p>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 2, label: '2 Meals', desc: 'Intermittent fasting' },
                        { value: 3, label: '3 Meals', desc: 'Traditional eating' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, meals: option.value })}
                          className={`p-6 rounded-xl transition-all ${
                            formData.meals == option.value
                              ? 'bg-[#A8C995] text-slate-800 scale-105'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <div className="text-3xl font-bold mb-2">{option.value}</div>
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-slate-800">Dietary Preferences </h2>
                    <p className="text-slate-600 text-sm mb-4">Help us filter recipes for you</p>

                    <div className="space-y-3 mb-4"></div>

                    <div>
                      <label className="text-slate-800 text-sm font-semibold mb-2 block">
                        Allergies or Restrictions (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., nuts, dairy, gluten"
                        value={formData.allergies}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                        className="w-full p-3 rounded-lg bg-slate-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A8C995]"
                      />
                    </div>

                    <div className="mt-3 bg-slate-100 rounded-lg p-3 text-xs text-slate-600">
                      We'll automatically filter out these ingredients
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 px-4 py-3 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-all"
                    >
                      ← Back
                    </button>
                  )}
                  {step < totalSteps ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 px-4 py-3 rounded-lg bg-[#A8C995] text-slate-800 font-bold hover:bg-[#94BF7F] hover:scale-105 transition-all shadow-lg"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-3 rounded-lg bg-[#A8C995] text-slate-800 font-bold hover:bg-[#94BF7F] hover:scale-105 transition-all shadow-lg"
                    >
                      Create My Plan!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingCard;
