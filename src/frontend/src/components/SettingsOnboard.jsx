/**
 * @file SettingsOnboard.jsx
 * @description This component provides a form for users to update their dietary
 * preferences and settings after the initial onboarding. It is typically
 * accessed from the main settings page.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SettingsOnboard = ({ setShowPreferences }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    calories: 2000,
    budget: 50,
    meals: 2,
    allergies: '',
    update: true // Flag to indicate that this is an update to existing preferences.
  });

  const handleSubmit = async () => {
    setShowPreferences(false);

    try {
      const res = await fetch('api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      localStorage.removeItem('onboarding');

      if (res.ok) {
        const data = await res.json();
        console.table(data);
        alert('Preferences updated successfully!');
      } else {
        alert('Failed to update preferences');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating preferences');
    }
  };

  return (
    <div className="min-h-screen fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-[#89a887] rounded-2xl relative shadow-2xl p-8 max-w-md w-full text-white"
      >
        <button
          className="absolute top-2 right-1 text-white/70 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          onClick={() => setShowPreferences(false)}
        >
          ×
        </button>

        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6">
          Update Preferences
        </h1>

        <div className="space-y-6">
          {/* Calories */}
          <div>
            <h2 className="text-lg font-bold mb-2">Daily Calorie Intake</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <input
                type="range"
                min="1400"
                max="3000"
                step="100"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>1400</span>
                <span>3000</span>
              </div>
              <div className="mt-2 text-center">
                <p className="text-2xl font-bold">{formData.calories}</p>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <h2 className="text-lg font-bold mb-2">Weekly Budget</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>$20</span>
                <span>$150</span>
              </div>
              <div className="mt-2 text-center">
                <p className="text-2xl font-bold">${formData.budget}</p>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div>
            <h2 className="text-lg font-bold mb-2">Meals per Day</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 2, label: '2 Meals', desc: 'Intermittent fasting' },
                { value: 3, label: '3 Meals', desc: 'Traditional eating' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, meals: option.value })}
                  className={`p-4 rounded-xl transition-all ${
                    formData.meals == option.value
                      ? 'bg-white text-green-600 scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h2 className="text-lg font-bold mb-2">Allergies or Restrictions</h2>
            <input
              type="text"
              placeholder="e.g., nuts, dairy, gluten"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-8 w-full py-3 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
        >
          Save Changes
        </button>
      </motion.div>
    </div>
  );
};

export default SettingsOnboard;
