// RecipePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

const RecipePage = () => {

    const location = useLocation();
    const { name } = location.state || {}
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stepCompleted, setStepCompleted] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [mealEaten, setMealEaten] = useState(false);



    const markMealAsEaten = async () => {
        try {
            const token = localStorage.getItem("token");

            const url = `http://localhost:8080/api/meals/updateMeal?name=${encodeURIComponent(name)}`;
            console.log("Request URL:", url);

            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });


            if (response.ok) {
                console.log(`Meal '${name}' marked as eaten.`);
            } else {
                console.error("Failed to mark meal as eaten:", response.status);
            }
        } catch (error) {
            console.error("Error marking meal as eaten:", error);
        }
    };

    useEffect(() => {
        const loadMeal = async () => {
            if (!name) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const encodedName = encodeURIComponent(name);
                const response = await fetch(`http://localhost:8080/api/meal?name=${encodedName}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRecipe(Array.isArray(data) ? data[0] : data);
                } else {
                    console.error("Failed to load meal:", response.status);
                    setRecipe(null);
                }
            } catch (error) {
                console.error("Error loading meal:", error);
                setRecipe(null);
            } finally {
                setLoading(false);
            }
        };

        loadMeal();
    }, [name]);

    const steps = useMemo(() => {
        if (!recipe?.instructions) return [];
        return recipe.instructions
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .split(/\n+/)
            .filter(step => step.trim() !== '');
    }, [recipe?.instructions]);

    // Initialize stepCompleted only when steps change
    useEffect(() => {
        if (steps && steps.length > 0) {
            setStepCompleted(new Array(steps.length).fill(false));
        }
    }, [steps]);

    // Check if all steps are completed
    useEffect(() => {
        // Only run if we have steps and stepCompleted is initialized
        if (stepCompleted.length > 0 && steps.length > 0) {
            const allCompleted = stepCompleted.every(Boolean);

            if (allCompleted && !mealEaten) { // Only trigger if not already eaten
                setShowPopup(true);
                setMealEaten(true);

                const timer = setTimeout(() => {
                    setShowPopup(false);
                }, 4000);

                // Cleanup timeout if component unmounts
                return () => clearTimeout(timer);
            }
        }
    }, [stepCompleted, steps.length, mealEaten]);

    // Call API when meal is marked as eaten
    useEffect(() => {
        const markMeal = async () => {
            if (mealEaten && name) {
                try {
                    await markMealAsEaten();
                } catch (error) {
                    console.error("Failed to mark meal as eaten:", error);
                    // Optionally reset mealEaten on error
                    // setMealEaten(false);
                }
            }
        };

        markMeal();
    }, [mealEaten, name]);

    console.log("Full recipe object:", recipe);
    console.log("Name: ", name)
    console.log("Recipe ingredients:", recipe?.ingredients);
    console.log("Type of ingredients:", typeof recipe?.ingredients);

    const navigate = useNavigate();

    // Convert YouTube URL to embed format
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.split('v=')[1];
        const ampersandPosition = videoId?.indexOf('&');
        if (ampersandPosition !== -1) {
            return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const embedUrl = getYouTubeEmbedUrl(recipe?.youtube);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#3f783f] flex justify-center items-center">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="min-h-screen bg-[#3f783f] flex justify-center items-center">
                <div className="text-center">
                    <p className="text-white text-xl mb-4">No recipe data found</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#668B67]"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // markMealAsEaten should be stable or memoized


    console.log(steps);


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#6d9851] to-[#5A7A4D] dark:bg-black flex justify-center items-start p-6">
            {showPopup && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                    <p>Congratulations on your meal!</p>
                </div>
            )}
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Back Button */}
                <div className="p-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#668B67] transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Hero Section */}
                {recipe.thumbnail && (
                    <div className="relative h-80">
                        <img
                            src={recipe.thumbnail}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                                {recipe.name}
                            </h1>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-white/30 backdrop-blur-md text-white rounded-full text-sm font-medium">
                                    {recipe.category}
                                </span>
                                <span className="px-3 py-1 bg-white/30 backdrop-blur-md text-white rounded-full text-sm font-medium">
                                    {recipe.area}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {/* Nutritional Info */}
                    {(recipe.calories > 0 || recipe.protein > 0 || recipe.carbohydrate > 0 || recipe.fat > 0) && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h2 className="text-2xl font-semibold mb-3 text-[#5C7A62] dark:text-gray-200">Nutritional Information</h2>

                            {recipe.calories > 0 && (
                                <div className="text-start">
                                    <p className="font-medium pr-5 text-gray-600 dark:text-gray-400">Calories</p>
                                    <p className="text-xl pr-5 font-bold text-[#5C7A62] dark:text-gray-200">{recipe.calories} kcal</p>
                                </div>
                            )}
                            {recipe.protein > 0 && (
                                <div className="text-center">
                                    <p className="font-medium text-gray-600 dark:text-gray-400">Protein</p>
                                    <p className="text-xl font-bold text-[#5C7A62] dark:text-gray-200">{recipe.protein}g</p>
                                </div>
                            )}
                            {recipe.carbohydrate > 0 && (
                                <div className="text-center">
                                    <p className="font-medium text-gray-600 dark:text-gray-400">Carbs</p>
                                    <p className="text-xl font-bold text-[#5C7A62] dark:text-gray-200">{recipe.carbohydrate}g</p>
                                </div>
                            )}
                            {recipe.fat > 0 && (
                                <div className="text-center">
                                    <p className="font-medium text-gray-600 dark:text-gray-400">Fat</p>
                                    <p className="text-xl font-bold text-[#5C7A62] dark:text-gray-200">{recipe.fat}g</p>
                                </div>
                            )}

                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Ingredients */}
                        <div className="md:col-span-1">
                            <h2 className="text-2xl font-semibold mb-3 text-[#5C7A62] dark:text-gray-200">Ingredients</h2>
                            <ul className="space-y-2">
                                {recipe.ingredients && Object.entries(recipe.ingredients).map(([ingredient, measure], index) => (
                                    <li key={index} className="flex items-start p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <span className="text-[#7A9E7E] mr-3 mt-1">•</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            <span className="font-bold">{measure}</span> {ingredient}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-semibold mb-3 text-[#5C7A62] dark:text-gray-200">Instructions</h2>
                            <ol className="space-y-4">
                                {steps.map((step, index) => (
                                    <li
                                        key={index}
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${stepCompleted[index] ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                        onClick={() => {
                                            const newStepCompleted = [...stepCompleted];
                                            newStepCompleted[index] = !newStepCompleted[index];
                                            setStepCompleted(newStepCompleted);
                                        }}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${stepCompleted[index]
                                                ? 'bg-white text-green-500'
                                                : 'bg-[#7A9E7E] text-white'
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="text-gray-700 dark:text-gray-300">{step}</div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* YouTube Video */}
                    {embedUrl && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4 text-[#5C7A62] dark:text-gray-200">Video Tutorial</h2>
                            <div className="aspect-w-16 aspect-h-9 h-[450px]">
                                <iframe
                                    src={embedUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full rounded-lg shadow-md"
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {recipe.tags && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-3 text-[#5C7A62] dark:text-gray-200">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {recipe.tags.split(',').map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-[#E8F3E8] text-[#5C7A62] rounded-full text-sm font-medium"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default RecipePage;
