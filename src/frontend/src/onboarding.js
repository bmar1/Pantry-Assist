import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    calories: 2000,
    budget: 50,
    meals: 2,
    vegan: false,
    allergies: "",
  });

  const totalSteps = 4;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    navigate("/LoadingScreen");
    try {
      const res = await fetch("http://localhost:8080/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
         },
        body: JSON.stringify(formData),
      });
    
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br 
    from-green-400 to-green-700 p-6">
      <h1 className="absolute top-14 left-1/2 transform 
      -translate-x-1/2 text-3xl md:text-4xl font-extrabold text-white">
        Help us get to know you!
      </h1>
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
            className="text-center text-white text-2xl font-semibold"
          >
            Welcome! Before we start, please answer these questions.
            <div className="mt-6">
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl shadow-lg bg-green-600 text-white p-6">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-2 bg-green-300 rounded-full">
                  <div
                    className="h-2 bg-white rounded-full transition-all"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
                <p className="text-sm mt-1">Step {step} of {totalSteps}</p>
              </div>

              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold mb-2">Daily Calorie Intake</h2>
                  <input
                    type="range"
                    min="1400"
                    max="2500"
                    step="100"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full"
                  />
                  <p>{formData.calories} calories/day</p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold mb-2">Weekly Budget</h2>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full"
                  />
                  <p>${formData.budget}/week</p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-lg font-bold mb-2">Meals per Day</h2>
                  <select
                    value={formData.meals}
                    onChange={(e) => setFormData({ ...formData, meals: e.target.value })}
                    className="p-1.5 rounded text-black"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-lg font-bold mb-2">Dietary Restrictions</h2>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.vegan}
                      onChange={(e) => setFormData({ ...formData, vegan: e.target.checked })}
                    />
                    <span>Vegan</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Allergies (optional)"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="mt-2 p-2 rounded w-full text-black"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-black font-bold hover:bg-gray-300"
                  >
                    Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
