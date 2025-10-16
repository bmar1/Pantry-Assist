// RecipePage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const RecipePage = () => {
    const navigate = useNavigate();

    const recipe = {
        title: "Chocolate Chip Cookies",
        image: "https://images.unsplash.com/photo-1599785209707-72baf8debc5f?auto=format&fit=crop&w=800&q=80",
        url: "https://www.youtube.com/watch?v=3vUtRRZG0xY",
        ingredients: [
            "1 cup butter",
            "1 cup white sugar",
            "2 cups flour",
            "2 cups chocolate chips",
            "2 eggs",
            "1 tsp vanilla extract",
            "1 tsp baking soda",
            "1/2 tsp salt"
        ],
        steps: [
            "Preheat the oven to 350°F (175°C).",
            "Mix butter and sugar until creamy.",
            "Add eggs and vanilla extract and mix well.",
            "Combine flour, baking soda, and salt, then gradually add to the mixture.",
            "Stir in chocolate chips.",
            "Drop spoonfuls onto a baking sheet.",
            "Bake for 10-12 minutes or until golden brown.",
            "Cool on wire racks and enjoy!"
        ]
    };

    return (
        <div className="min-h-screen bg-[#3f783f] flex justify-center items-start p-6">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 border border-[#C7D6C1]">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-4 px-4 py-2 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#668B67]"
                >
                    Back to Home
                </button>

                <h1 className="text-3xl font-bold mb-4 text-[#7A9E7E]">{recipe.title}</h1>

                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-64 object-cover rounded-lg mb-6 border border-[#DCE5DC]"
                />

                <div className="mb-6">
                    <video controls className="w-full h-64 object-cover rounded-lg border border-[#88ca88]">
                        <source src={recipe.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2 text-[#5C7A62]">Ingredients</h2>
                    <ul className="list-disc list-inside space-y-1 text-[#4C5E4C]">
                        {recipe.ingredients.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2 text-[#5C7A62]">Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-[#4C5E4C]">
                        {recipe.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;
