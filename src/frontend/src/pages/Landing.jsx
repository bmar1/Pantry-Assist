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
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    // Navigates the user to the login page.
    const handleNavigation = () => {
        navigate("/Login");
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f7f5f0">
            {/* Navigation Bar */}
            <nav className="bg-gradient-to-b from-[#618c45] to-[#5A7A4D] shadow-md px-4 sm:px-8 py-4 flex items-center justify-between">
                {/* Left Side Group */}
                <div className="flex items-center gap-6">

                    <div className="flex items-center gap-2">
                        <img src="/favicon.png" className="w-auto h-12 sm:h-14" alt="Logo" />
                        <h2 className="text-white text-lg sm:text-xl font-semibold">Pantry Assist</h2>
                    </div>
                    <button
                        onClick={() => navigate("/About")}
                        className="bg-[#ffffff] text-[#5A7A4D] hover:bg-[#cedfc2] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md hidden md:block"
                    >
                        About Us
                    </button>
                </div>

                {/* Right Side Group */}
                <div className="flex items-center">
                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            onClick={handleNavigation}
                            className="bg-[#8abeeb] hover:bg-[#92c8f8] text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md hidden md:block"
                        >
                            Login
                        </motion.button>
                        <button
                            onClick={handleNavigation}
                            className="bg-[#ffffff] text-[#5A7A4D] hover:bg-[#cedfc2] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            Build Plan
                        </button>
                    </div>
                    {/* Mobile Hamburger */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#5A7A4D] text-center py-4">
                    <button
                        onClick={() => { navigate("/About"); setIsMenuOpen(false); }}
                        className="block w-full py-2 text-white hover:bg-[#446437]"
                    >
                        About Us
                    </button>
                    <button
                        onClick={() => { handleNavigation(); setIsMenuOpen(false); }}
                        className="block w-full py-2 text-white hover:bg-[#446437]"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { handleNavigation(); setIsMenuOpen(false); }}
                        className="block w-full py-2 text-white hover:bg-[#446437]"
                    >
                        Build Plan
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <div className="flex items-center justify-center min-h-[90vh] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative h-[75vh] w-full max-w-[100rem] rounded-xl md:rounded-lg overflow-hidden shadow-2xl"
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
                            className="text-5xl md:text-5xl lg:text-8xl font-[500] mb-6 text-[#fffefa] leading-tight"
                        >
                            Meal and budget
                            <br></br>
                            tracking, made easy
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-2xl md:text-3xl lg:text-4xl mb-12 max-w-4xl text-[#fffefa] font-light"
                        >
                            Pantry Assist is your meal planner and budget maintainer all in one — letting you focus on growing instead of tracking.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            onClick={handleNavigation}
                            className="bg-[#819c57] hover:bg-[#94b264] w-[220px] md:w-[250px] text-white px-10 py-4 rounded-lg font-semibold text-xl md:text-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                        >
                            Build Plan
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <div className="h-32 w-full bg-gradient-to-b from-transparent to-[#f7faf5]" />

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="py-20 relative bg-gradient-to-b from-[#f7faf5] to-[#eef3e8]">

                    {/* Ambient CSS Glow */}
                    <div className="absolute inset-0 pointer-events-none 
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent_70%)]
            
        " />

                    <h1 className="text-black font-semibold text-5xl md:text-6xl text-center mb-12 relative z-10">
                        The Pantry
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 relative z-10">
                        {[
                            {
                                img: "/icons/input.png",
                                title: "What You Input",
                                desc: "Enter your weekly budget, dietary preferences, and goals — we take it from there."
                            },
                            {
                                img: "/icons/delivery.png",
                                title: "How It's Delivered",
                                desc: "Weekly meal plans, shopping lists, and nutrition info all in one place."
                            },
                            {
                                img: "/icons/benefit.png",
                                title: "Why Use It",
                                desc: "Save money, eat better, and track meals effortlessly."
                            },
                            {
                                img: "/icons/result.png",
                                title: "End Result",
                                desc: "Live well with balanced meals and zero stress — all for free."
                            }
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="
                        p-6 rounded-2xl 
                        bg-white/60 
                        backdrop-blur-xl 
                        border border-white/40 
                        shadow-lg hover:shadow-2xl 
                        flex flex-col items-center text-center
                        hover:scale-105 transition-all duration-300
                    "
                            >
                                <img src={card.img} className="w-16 h-16 mb-4" />
                                <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">{card.title}</h3>
                                <p className="text-base font-medium text-[#336e32]">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>


            <div className="w-full h-10 shadow-[0_-25px_40px_-20px_rgba(0,0,0,0.35)]" />

            {/* ——— Mid-page CTA ——— */}
            <div className="py-20 relative text-center bg-gradient-to-t from-[#f9fbf7] to-[#f0f5ea]">

                {/* Top Glow */}
                <div className="absolute inset-x-0 top-0 h-40 
        bg-gradient-to-b from-white/40 to-transparent
        pointer-events-none
    " />

                <h2 className="text-4xl md:text-5xl font-semibold text-[#2c5e2] mb-6 relative z-10">
                    Start Saving on Groceries Today — For Free
                </h2>

                <p className="text-lg text-[#336e32]  max-w-2xl mx-auto mb-8 relative z-10">
                    Build your personalized meal plan in under one minute.
                </p>

                <button onClick={handleNavigation} className="px-10 py-4 bg-[#2c5e2] bg-[#819c57] hover:bg-[#94b264] w-[220px] md:w-[250px] text-white px-10 py-4 rounded-lg font-semibold text-xl md:text-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 transition relative z-10">
                    Build My Plan
                </button>
            </div>

            {/* SECTION: Popular Meal Plans */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-20 relative bg-gradient-to-b from-[#f5f8f2] to-white"
            >

                {/* Ambient Glow */}
                <div className="absolute inset-0 pointer-events-none 
        bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_75%)]
    " />

                <h2 className="text-black font-semibold text-5xl md:text-6xl text-center mb-12 relative z-10">
                    Popular Meal Plans
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative z-10">
                    {[
                        {
                            img: "/pancakes.jpg",
                            title: "Fluffy Pancakes",
                            info: "Prep Time: 15 mins | Est. Cost: $3",
                            desc: "Start your day with these delicious, easy-to-make pancakes.",
                            overlay: "Imagine waking up to warm, fluffy pancakes — a comforting start to your day."
                        },
                        {
                            img: "/icons/salad.jpg",
                            title: "Quinoa Salad",
                            info: "Prep Time: 20 mins | Est. Cost: $5",
                            desc: "A refreshing salad packed with protein and fiber.",
                            overlay: "Bright, refreshing Mediterranean flavors in one bowl."
                        },
                        {
                            img: "/icons/stirfry.jpg",
                            title: "Chicken Stir-Fry",
                            info: "Prep Time: 25 mins | Est. Cost: $7",
                            desc: "Quick, flavorful stir-fry with chicken and veggies.",
                            overlay: "A bold, delicious stir-fry full of color and flavor."
                        }
                    ].map((meal, i) => (
                        <div
                            key={i}
                            className="
                    relative rounded-2xl overflow-hidden 
                    bg-white/60 
                    backdrop-blur-xl 
                    border border-white/40 
                    shadow-lg hover:shadow-2xl 
                    hover:scale-105 
                    transition-all duration-300
                "
                        >
                            <img src={meal.img} className="w-full h-64 object-cover" />
                            <div className="p-6">
                                <h3 className="text-2xl font-semibold mb-2 text-[#2c5e2]">{meal.title}</h3>
                                <p className="text-base font-medium text-[#336e32]">{meal.info}</p>
                                <p className="text-sm text-gray-500 mb-4">{meal.desc}</p>
                            </div>

                            <div className="absolute inset-0 bg-white/70  backdrop-blur-md 
                    flex items-center justify-center px-6
                    opacity-0 hover:opacity-100 transition duration-300 text-center
                ">
                                <p className="text-lg font-medium text-black dark:text-white">{meal.overlay}</p>
                            </div>
                        </div>
                    ))}
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
                                <li><a href="/About" className="text-gray-200 hover:text-white transition-colors">About Us</a></li>
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





