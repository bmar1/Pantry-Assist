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
            const response = await fetch(`http://localhost:8080/api/meals/allMeals`, {
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
        <div className="min-h-screen bg-gray-100 dark:bg-black">
            <Nav
                isNavVisible={isNavVisible}
                setIsNavVisible={setIsNavVisible}
                setShowSettings={setShowSettings}
                handleLogout={handleLogout}
            />
            {showSettings && <Settings setShowSettings={setShowSettings} setShowPreferences={setShowPreferences} />}
            {showPreferences && <SettingsOnboard setShowPreferences={setShowPreferences} />}

            <main className={`p-8 transition-all duration-300 ${isNavVisible ? 'ml-60' : 'ml-20'}`}>
                <h1 className="text-4xl font-bold text-center mb-10">All Meals</h1>
                <div className="meal-list-container">
                    {meals.map((meal) => (
                        <div key={meal.id} className="meal-card" onClick={() => handleRecipeClick(meal.name)}>
                            <img src={meal.thumbnail} alt={meal.name} className="meal-card-image" />
                            <div className="meal-card-content">
                                <h2 className="meal-card-title">{meal.name}</h2>
                                <p className="meal-card-details">Calories: {meal.calories}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
