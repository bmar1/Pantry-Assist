/**
 * @file Landing.js
 * @description This component is the main landing page for the application.
 * It provides an overview of the app's features, showcases popular meal plans,
 * and includes calls-to-action for users to log in or create a plan.
 * It is designed to be visually appealing and informative for new visitors.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

export default function Landing() {
    const navigate = useNavigate();

    // Navigates the user to the login page.
    const handleNavigation = () => {
        navigate("/Login");
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f7f5f0] dark:bg-black">
            {/* Navigation Bar */}
            <nav className="bg-gradient-to-b from-[#618c45] to-[#5A7A4D] shadow-md px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/favicon.png" className="w-auto h-14 mr-2 pr-2" alt="Logo" />
                    <h2 className="text-white text-xl font-semibold">Pantry Assist - Track your meals, fuel your life</h2>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleNavigation}
                        className="bg-[#ffffff] text-[#5A7A4D] hover:bg-[#73a552] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md transition-delay-100"
                    >
                        Login
                    </button>
                    <button
                        onClick={handleNavigation}
                        className="bg-[#ffffff] text-[#5A7A4D] hover:bg-[#73a552] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md transition-delay-100"
                    >
                        Build Plan
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex items-center -top-10 mt-10 justify-center py-12">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative h-[400px] md:h-[500px] lg:h-[500px] w-full max-w-6xl rounded-xl md:rounded-3xl overflow-hidden shadow-2xl"
                >
                    <img
                        src="/hero.jpg"
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-7xl font-bold mb-4 text-[#fffefa]"
                        >
                            Pantry Assist
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-3xl mb-8 max-w-2xl text-[#fffef]"
                        >
                            Track your meals. Fuel your life.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            onClick={handleNavigation}
                            className="bg-[#5A7A4D] hover:bg-[#446437] w-[200px] text-white px-8 py-3 rounded-md font-semibold text-lg transition-colors shadow-lg"
                        >
                            Build Plan
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <br></br>

            {/* Main responsive content */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className=""
            >
                <div className="py-16 -pt-10 bg-gray-100 dark:bg-black">
                    <h1 className="text-[#bbc9aa] font-semibold text-5xl md:text-6xl text-center mb-12">The Pantry</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
                        {/* Input Section */}
                        <div className=" p-6 rounded-2xl  flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <img src="/icons/input.png" alt="Input" className="w-16 h-16 mb-4" />
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">What You Input</h3>
                            <p className="text-base font-medium text-[#336e32]">
                                Enter your weekly budget, dietary preferences, and calorie goals — we take it from there.
                            </p>
                        </div>

                        {/* Delivery Section */}
                        <div className=" p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <img src="/icons/delivery.png" alt="Delivery" className="w-16 h-16 mb-4" />
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">How It's Delivered</h3>
                            <p className="text-base font-medium text-[#336e32]">
                                Get weekly meal plans, shopping lists, and nutrition info directly — all in one place.
                            </p>
                        </div>

                        {/* Benefit Section */}
                        <div className=" p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <img src="/icons/benefit.png" alt="Benefit" className="w-16 h-16 mb-4" />
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">Why Use It</h3>
                            <p className="text-base font-medium text-[#336e32]">
                                Save money, eat better, and track your meals efficiently, everyone deserves to.
                            </p>
                        </div>

                        {/* Result Section */}
                        <div className=" p-6 rounded-2xl  flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <img src="/icons/result.png" alt="Result" className="w-16 h-16 mb-4" />
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">End Result</h3>
                            <p className="text-base font-medium text-[#336e32]">
                                Live well with balanced meals, better planning, and zero stress — all for free.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Meal Plan Showcase */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-16"
            >
                <h2 className="text-[#bbc9aa] font-semibold text-5xl md:text-6xl text-center mb-12">Popular Meal Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                    {/* Meal Card 1 */}
                    <div className="relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 overflow-hidden">
                        <img src="/pancakes.jpg" alt="Pancakes" className="w-full h-64 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">Fluffy Pancakes</h3>
                            <p className="text-base font-medium text-[#336e32]">Prep Time: 15 mins | Est. Cost: $3</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 relative">Start your day with these delicious and easy-to-make pancakes.</p>
                        </div>
                        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center transition-colors duration-300 p-4 opacity-0 hover:opacity-100 delay-200">
                            <p className="text-black text-lg font-medium text-center relative -top-16">
                                Imagine waking up to warm, fluffy pancakes, a comforting start to your day.
                            </p>
                        </div>
                    </div>

                    <div className="relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 overflow-hidden">
                        <img src="/icons/salad.jpg" alt="Quinoa Salad" className="w-full h-64 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">Quinoa Salad</h3>
                            <p className="text-base font-medium text-[#336e32]">Prep Time: 20 mins | Est. Cost: $5</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">A healthy and refreshing salad packed with protein and fiber.</p>
                        </div>
                        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center transition-colors duration-300 p-4 opacity-0 hover:opacity-100 delay-200">
                            <p className="text-black text-lg font-medium text-center relative -top-16">
                                Transport yourself to the sunny Mediterranean with this vibrant and refreshing salad.
                            </p>
                        </div>
                    </div>


                    <div className="relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 overflow-hidden">
                        <img src="/icons/stirfry.jpg" alt="Chicken Stir-Fry" className="w-full h-64 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">Chicken Stir-Fry</h3>
                            <p className="text-base font-medium text-[#336e32]">Prep Time: 25 mins | Est. Cost: $7</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">A quick and flavorful stir-fry with chicken and vegetables.</p>
                        </div>
                        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center transition-colors duration-300 p-4 opacity-0 hover:opacity-100 delay-200">
                            <p className="text-black text-lg font-medium text-center relative -top-16">
                                Savor the taste of Asia with this quick and flavorful chicken and vegetable stir-fry.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>


            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-16"
            >
                <h2 className="text-[#bbc9aa] font-semibold text-5xl md:text-6xl text-center mb-12">Why Choose Pantry Assist?</h2>

                <p className="text-center text-xl text-[#336e32] dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                    Pantry Assist is more than just a meal planner, it's your personal assistant for a healthier, more affordable, and stress-free food life. We combine smart technology with a passion for good food to deliver a unique experience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2] text-center">Maximize Your Budget</h3>
                        <p className="text-base font-medium text-[#336e32] dark:text-gray-400">
                            Our smart algorithms analyze grocery prices and suggest the most cost-effective meal plans, helping you save up to 30% on your food bill.
                        </p>
                    </div>


                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2] text-center">Personalized Nutrition</h3>
                        <p className="text-base font-medium text-[#336e32] dark:text-gray-400">
                            We tailor meal plans to your dietary preferences and nutritional needs, ensuring you get the right balance of nutrients for a healthier lifestyle.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <footer className="bg-[#5A7A4D] text-white py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-8">
                    {/* Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img src="/favicon.png" className="w-10 h-10" alt="Logo" />
                                <h3 className="text-xl font-semibold">Pantry Assist</h3>
                            </div>
                            <p className="text-sm text-gray-200">
                                Plan meals, track calories, and save money effortlessly.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">How It Works</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Recipes</a></li>
                            </ul>
                        </div>


                        <div>
                            <h4 className="font-semibold mb-3">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h4 className="font-semibold mb-3">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Cookie Policy</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-400 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-200">
                        <p>© 2025 Pantry Assist. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">Facebook</a>
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}





