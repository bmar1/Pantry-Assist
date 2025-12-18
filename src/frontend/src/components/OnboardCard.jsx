/**
 * @file OnboardCard.jsx
 * @description This component renders a multi-step onboarding form for new users.
 * It collects information about their dietary preferences, budget, and calorie goals.
 * The form is presented as a modal and uses framer-motion for smooth transitions
 * between steps.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const OnboardingCard = ({ setShowOnboarding }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    calories: 2000,
    budget: 50,
    meals: 2,
    vegan: false,
    allergies: "",
    update: false
  });

  const totalSteps = 4;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setTimeout(() => {
      navigate("/LoadingScreen");
    }, 300);

    try {
      const res = await fetch("http://localhost:8080/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      setShowOnboarding(false);
      localStorage.removeItem("onboarding");
      if (res.ok) {
        const data = await res.json();
       
        console.table(data);
        alert("Onboarding data submitted successfully!");
      } else {
        alert("Failed to submit onboarding data");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting onboarding data");
    }
  };

 return (
 <div className="min-h-screen fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
  <div className="bg-green-600 rounded-2xl shadow-2xl p-8 max-w-lg  w-full relative">
    <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8">
      Let's personalize your meal plan! ✨
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
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <p className="text-white text-xl font-semibold mb-4">
              Welcome! Help us create your perfect meal plan
            </p>
            <p className="text-white/80 text-sm">
              This will only take a minute and helps us recommend recipes you'll love!
            </p>
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
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
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            {/* Progress bar with label */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-white/80">Step {step} of {totalSteps}</p>
                <p className="text-sm text-white/80">{Math.round((step / totalSteps) * 100)}%</p>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">Daily Calorie Target</h2>
                <p className="text-white/70 text-sm mb-4">We'll recommend recipes that fit your goals</p>
                
                {/* Quick presets */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: '🔥 Cut', value: 1500 },
                    { label: '🎯 Maintain', value: 2000 },
                    { label: '💪 Bulk', value: 2500 }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setFormData({ ...formData, calories: preset.value })}
                      className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                        formData.calories == preset.value
                          ? 'bg-white text-green-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
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
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, white 0%, white ${((formData.calories - 1400) / (3000 - 1400)) * 100}%, rgba(255,255,255,0.2) ${((formData.calories - 1400) / (3000 - 1400)) * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>1400</span>
                    <span>3000</span>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-3xl font-bold text-white">{formData.calories}</p>
                  <p className="text-white/70 text-sm">calories per day</p>
                </div>
                
                <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs text-white/80">
                  💡 Most adults need 1800-2500 calories/day
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">Weekly Budget 💰</h2>
                <p className="text-white/70 text-sm mb-4">We'll find recipes that fit your budget</p>
                
                {/* Quick presets */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[20, 40, 60, 80].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setFormData({ ...formData, budget: preset })}
                      className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                        formData.budget == preset
                          ? 'bg-white text-green-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
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
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white 0%, white ${((formData.budget - 20) / (150 - 20)) * 100}%, rgba(255,255,255,0.2) ${((formData.budget - 20) / (150 - 20)) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>$20</span>
                  <span>$150</span>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-3xl font-bold text-white">${formData.budget}</p>
                  <p className="text-white/70 text-sm">per week</p>
                </div>

                <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs text-white/80">
                  💡 Average weekly grocery budget is $50-80 per person
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">Meals per Day 🍽️</h2>
                <p className="text-white/70 text-sm mb-6">How many main meals do you eat?</p>
                
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
                          ? 'bg-white text-green-600 scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
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
                <h2 className="text-2xl font-bold mb-2 text-white">Dietary Preferences 🥗</h2>
                <p className="text-white/70 text-sm mb-4">Help us filter recipes for you</p>
                
                <div className="space-y-3 mb-4">
                  <label className="flex items-center p-4 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.vegan}
                      onChange={(e) => setFormData({ ...formData, vegan: e.target.checked })}
                      className="w-5 h-5 rounded text-green-600 mr-3"
                    />
                    <div>
                      <span className="text-white font-semibold">🌱 Vegan</span>
                      <p className="text-white/60 text-xs">Plant-based only</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">
                    Allergies or Restrictions (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., nuts, dairy, gluten"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full p-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs text-white/80">
                  💡 We'll automatically filter out these ingredients
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white font-bold hover:bg-white/30 transition-all"
                >
                  ← Back
                </button>
              )}
              {step < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-3 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                >
                  Create My Plan! 🎉
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
 )
};

 export default OnboardingCard;
  