/**
 * @file navbar.jsx
 * @description This component renders the application's sidebar navigation menu.
 * It includes links to the main pages, a summary of calorie intake, and options
 * for settings and logging out. The navbar can be expanded or collapsed.
 */

import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Nav({
  isNavVisible,
  setIsNavVisible,
  setShowSettings,
  handleLogout,
  progress,
  caloriesEaten,
  caloriesRemaining,
  caloriesTarget
}) {
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-60 bg-[#628d45] text-white flex flex-col p-4 z-40 shadow-lg"
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
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
              </button>
            </div>

            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col items-start w-full">
                <img
                  src="/favicon-v1.png"
                  alt="PLated Logo"
                  className="w-[8rem] h-[6.5rem] object-contain"
                />
                <h1 className="text-3xl font-semibold text-white tracking-wide mt-2 ml-4">
                  Plated
                </h1>
              </div>
            </div>

            <div className="flex flex-col space-y-4 flex-grow">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img
                  src="/icons/home.png"
                  alt="Home"
                  className="w-5 h-5"
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
                Home
              </Link>

              <Link
                to="/all-meals" // Assuming this is the correct path for "Your Recipes"
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img
                  src="/icons/recipes.png"
                  alt="Recipes"
                  className="w-5 h-5"
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
                Your Recipes
              </Link>

              <Link
                to="/grocery"
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img
                  src="/icons/groceryIcon.png"
                  alt="Grocery"
                  className="w-6 h-6"
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
                Grocery List
              </Link>

              <Link
                to="/analytics"
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium"
              >
                <img
                  src="/icons/result.png"
                  alt="analytics"
                  className="w-5 h-5"
                  style={{ filter: 'invert(1) brightness(2)' }}
                ></img>
                Analytics
              </Link>
            </div>

            <div className="rounded-2xl mb-5 bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[#b0a384] font-medium uppercase tracking-wider mb-1">
                    Today's Calories
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{caloriesEaten}</span>
                    <span className="text-slate-400 text-lg">/</span>
                    <span className="text-2xl font-semibold text-[#b0a384]">{caloriesTarget}</span>
                  </div>
                </div>
              </div>

              <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#b0a384] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-xs text-[#b0a384] mt-2 text-center">{progress}% of daily goal</p>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-3 mb-2 hover:bg-[#94bf7f] p-2 rounded-lg font-medium w-full text-left"
              >
                <img
                  src="/icons/settings.png"
                  alt="Settings"
                  className="w-5 h-5"
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded-lg font-medium w-full text-left"
              >
                <img
                  src="/icons/logout.png"
                  alt="Logout"
                  className="w-5 h-5"
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
                Log out
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {!isNavVisible && (
        <nav className="fixed top-0 left-0 h-screen w-14 bg-[#628d45] text-white flex flex-col p-2 z-40 shadow-lg items-center justify-between">
          <button onClick={showBar} className="p-2 bg-[#628d45] rounded-lg hover:bg-[#5A7A4D] mt-2">
            <img
              src="/icons/bar.jpg"
              alt="Menu"
              className="w-7 h-7"
              style={{ filter: 'invert(1) brightness(2)' }}
            />
          </button>

          <div className="flex flex-col space-y-4 mb-auto mt-8">
            <Link to="/dashboard" className="hover:bg-[#5A7A4D] p-2 rounded-lg">
              <img
                src="/icons/home.png"
                alt="Home"
                className="w-7 h-7"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </Link>
            <Link to="/all-meals" className="hover:bg-[#5A7A4D] p-2 rounded-lg">
              <img
                src="/icons/recipes.png"
                alt="Recipes"
                className="w-7 h-7"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </Link>
            <Link to="/grocery" className="hover:bg-[#5A7A4D] p-2 rounded-lg">
              <img
                src="/icons/groceryIcon.png"
                alt="Grocery"
                className="w-7 h-7"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </Link>
            <Link to="/analytics" className="hover:bg-[#5A7A4D] p-2 rounded-lg">
              <img
                src="/icons/result.png"
                alt="analytics"
                className="w-7 h-7"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </Link>
          </div>

          <div className="mb-2">
            <button onClick={handleLogout} className="hover:bg-[#5A7A4D] p-2 rounded-lg">
              <img
                src="/icons/logout.png"
                alt="Logout"
                className="w-7 h-7"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
