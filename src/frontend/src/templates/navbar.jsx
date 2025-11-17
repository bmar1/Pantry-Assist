/**
 * @file navbar.jsx
 * @description This component renders the application's sidebar navigation menu.
 * It includes links to the main pages, a summary of calorie intake, and options
 * for settings and logging out. The navbar can be expanded or collapsed.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Nav({ isNavVisible, setIsNavVisible, setShowSettings, handleLogout, progress }) {
  const navigate = useNavigate();

  const showBar = () => {
    setIsNavVisible(!isNavVisible);
  };

  return (
    <div>
      {/* Sidebar Navbar */}
      <AnimatePresence>
        {isNavVisible && (
          <motion.nav
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-60 bg-[#628d45] text-white flex flex-col p-4 z-40"
          >
            {/* Main nav links */}
            <div className="flex justify-end w-full">
              <button
                className="p-3 rounded-lg hover:bg-[#A8C995] transition-colors duration-200 flex items-center justify-center"
                onClick={showBar}
              >
                <img
                  src="/icons/bar.jpg"
                  alt="Menu"
                  className="w-5 h-5"
                />
              </button>
            </div>

            <div className="flex flex-col space-y-4 mb-10">
              <div className="flex flex-col items-start w-full -mt-10">
                <img
                  src="/favicon.png"
                  alt="Pantry Assist Logo"
                  className="w-[7.75rem] h-[7.75rem] object-contain"
                />
                <h1 className="text-3xl font-semibold text-white tracking-wide mt-2">
                  Pantry Assist
                </h1>
              </div>
            </div>

            <div className="flex flex-col space-y-4 flex-grow">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img src="/icons/home.png" alt="Home" className="w-5 h-5 ml-[1px]" />
                Home
              </Link>

              <Link
                to="/all-meals" // Assuming this is the correct path for "Your Recipes"
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img src="/icons/recipes.png" alt="Recipes" className="w-5 h-5" />
                Your Recipes
              </Link>

              <Link
                to="/grocery"
                className="flex items-center gap-2 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img src="/icons/groceryIcon.png" alt="Grocery" className="w-8 h-8 -ml-1" />
                Grocery List
              </Link>

              <Link
                to="/analytics" 
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img src="/icons/result.png" alt="analytics" className="w- h-5 ml-[2px]"></img>
                Analytics
              </Link>
            </div>

            <div className="rounded-xl bg-slate-200 p-4">
              <h2 className="text-base font-semibold text-black mb-2">
                Calories Remaining: 1200
              </h2>
              <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-[#84dfe2] h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <br></br>
            <br></br>

            <div className="mt-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium w-full text-left"
              >
                <img src="/icons/settings.png" alt="Settings" className="w-5 h-5 -ml-[1px]" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium w-full text-left"
              >
                <img src="/icons/logout.png" alt="Logout" className="w-5 h-5" />
                Log out
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {!isNavVisible && (
        <nav className="fixed top-0 left-0 h-screen w-14 bg-[#628d45] text-white flex flex-col p-4 z-40">
          <button
            onClick={showBar}
            className="fixed top-4 left-2 z-50 p-2 bg-[#628d45] rounded-lg hover:bg-[#5A7A4D]"
          >
            <img src="/icons/bar.jpg" alt="Menu" className="w-7 h-7" />
          </button>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="fixed bottom-1 left-2 z-50 hover:bg-[#5A7A4D] p-2 rounded-lg"
            >
              <img src="/icons/logout.png" alt="Logout" className="w-7 h-7" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

