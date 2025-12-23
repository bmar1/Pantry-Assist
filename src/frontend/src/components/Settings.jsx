/**
 * @file settings.jsx
 * @description This component renders a settings modal that allows users to manage
 * their account. It provides options to edit user preferences, change the theme,
 * and delete their account.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


export default function Settings({ setShowSettings, setShowPreferences }) {
  const navigate = useNavigate();

  // Sends a request to the backend to delete the user's account.
  // On success, it clears localStorage and redirects to the login page.
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/auth/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: localStorage.getItem("email"),
        }),
      });

      if (response.ok) {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

 
  const handleEditPreferences = () => {
    setShowSettings(false);
    setShowPreferences(true);
  };

  return (
    <div className="min-h-screen min-w-96 fixed inset-0 backdrop-blur-md bg-black/40 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setShowSettings(false)}
        >
          ×
        </button>
        <h1 className="text-3xl font-bold text-[#446437] text-center mb-8">
          Settings
        </h1>

        {/* User profile card */}
        <div className="bg-[#eeeeec] rounded-xl p-6 mb-5 flex items-center gap-4 mt-2">
          <img
            src="/icons/avatar.png"
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex flex-col justify-center flex-grow">
            <h2 className="text-xl font-semibold text-gray-800">
              {localStorage.getItem("email")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">User</p>
          </div>
        </div>
        <div className="mb-7 pt-5">
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-[#5A7A4D] hover:bg-[#446437] text-white font-medium py-3 rounded-lg transition-colors"
          >
            Change Password
          </button>
        </div>

        <div className="mb-6 flex flex-row gap-10">
          <button
            onClick={handleEditPreferences}
            className="w-full bg-[#5A7A4D] hover:bg-[#446437] text-white font-medium py-3 rounded-lg transition-colors"
          >
            Edit Preferences
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full bg-[#5A7A4D] hover:bg-[#446437] text-white font-medium py-3 rounded-lg transition-colors">
            Change Theme
          </button>
        </div>
        <br></br>

        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Delete Account
        </button>
      </motion.div>
    </div>
  );
}