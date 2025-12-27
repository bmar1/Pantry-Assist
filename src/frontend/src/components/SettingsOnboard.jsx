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
    vegan: false,
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
        className="bg-white rounded-2xl relative shadow-2xl p-8 max-w-md w-full text-green-700"
      >
        <button
          className="absolute top-2 right-1 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowPreferences(false)}
        >
          ×
        </button>

        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6">
          Help us get to know you!
        </h1>

        {/* Calories */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Daily Calorie Intake</h2>
          <input
            type="range"
            min="1400"
            max="2500"
            step="100"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            className="w-full accent-green-600"
          />
          <p className="text-sm mt-1">{formData.calories} calories/day</p>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Weekly Budget</h2>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full accent-green-600"
          />
          <p className="text-sm mt-1">${formData.budget}/week</p>
        </div>

        {/* Meals */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Meals per Day</h2>
          <select
            value={formData.meals}
            onChange={(e) => setFormData({ ...formData, meals: Number(e.target.value) })}
            className="p-2 rounded w-full border border-gray-300"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>

        {/* Allergies / Vegan */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Dietary Restrictions</h2>
          <div className="flex items-center space-x-2 mb-2">
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
            className="p-2 rounded w-full border border-gray-300"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition"
        >
          Submit
        </button>
      </motion.div>
    </div>
  );
};

export default SettingsOnboard;
