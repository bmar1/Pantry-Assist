/**
 * @file AllMeals.js
 * @description This component displays a grid of all available meals.
 * It fetches the meal data from the API and renders each meal as a card.
 * Users can click on a meal card to navigate to the detailed recipe page.
 */

import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Nav from "../components/Navbar";
import '../styles/allMeals.css';
import Settings from "../components/Settings";
import SettingsOnboard from "../components/SettingsOnboard"

export default function AllMeals() {
    const navigate = useNavigate();
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [meals, setMeals] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    useEffect(() => {
        loadMeals();
    }, []);

    const loadMeals = async () => {
        try {
            const response = await fetch(`/api/meals/allMeals`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMeals(data);
            }
        } catch (error) {
            console.error("Error parsing meals:", error);
        }
    };

    const handleRecipeClick = (recipeName) => {
        navigate("/recipe", { state: { name: recipeName } })
    };

    return (
        <div className="min-h-screen bg-gray-100 ">
            <Nav
                isNavVisible={isNavVisible}
                setIsNavVisible={setIsNavVisible}
                setShowSettings={setShowSettings}
                handleLogout={handleLogout}
            />
            {showSettings && <Settings setShowSettings={setShowSettings} setShowPreferences={setShowPreferences} />}
            {showPreferences && <SettingsOnboard setShowPreferences={setShowPreferences} />}

            <main className={`p-8 transition-all duration-300 ${isNavVisible ? 'ml-60' : 'ml-20'}`}>
            <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">All Meals</h1>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {meals.map((meal) => (
            <div 
                key={meal.id} 
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#628d45] transform hover:-translate-y-2"
                onClick={() => handleRecipeClick(meal.name)}
            >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                        src={meal.thumbnail} 
                        alt={meal.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    <div className="absolute top-3 right-3 bg-[#628d45] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                        {meal.calories} cal
                    </div>
                    
                    {meal.category && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#628d45] px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            {meal.category}
                        </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#628d45] transition-colors line-clamp-2">
                        {meal.name}
                    </h2>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-[#628d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="font-semibold">{meal.calories} cal</span>
                        </div>
                        
                        {/* trigger on hover*/}
                        <div className="flex items-center text-[#628d45] font-semibold text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                            View Recipe
                        
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
</main>
        </div>
    );
}
