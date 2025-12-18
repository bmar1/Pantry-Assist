/**
 * @file DarkModeContext.jsx
 * @description This file provides a React context and a custom hook (`useDarkMode`)
 * for managing the application's dark mode theme. It persists the user's
 * preference in localStorage and applies the appropriate CSS class to the
 * root HTML element to toggle the theme.
 * 
 * UN-USED FOR NOW.
 */

import { createContext, useState, useEffect, useContext } from "react";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // On initial load, check for a saved preference in localStorage.
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
  }, []);

  // When the darkMode state changes, update the CSS class on the root element
  // and save the preference to localStorage.
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Custom hook for consuming the DarkModeContext easily in other components.
export const useDarkMode = () => useContext(DarkModeContext);
