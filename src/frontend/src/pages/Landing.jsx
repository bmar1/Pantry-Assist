/**
 * @file Landing.js
 * @description This component is the main landing page for the application.
 * It provides an overview of the app's features, showcases popular meal plans,
 * and includes calls-to-action for users to log in or create a plan.
 * It is designed to be visually appealing and informative for new visitors.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  // Navigates the user to the login page.
  const handleNavigation = () => {
    navigate('/Login');
  };

  const steps = [
    {
      id: '01',
      title: 'Create your plan',
      description: "Login and create a new meal plan, let us do the work and you're ready.",
      // Content for the "Card" side
      cardContent: <div className=""></div>
    },
    {
      id: '02',
      title: 'Meal Plan',
      description: 'Take a look at your new meals, let us generate new meals for you daily.',
      cardContent: <div className=""></div>
    },
    {
      id: '03',
      title: 'Groceries',
      description:
        'Shop new groceries weekly, on a tight or flexible budget, directly from local vendors.',
      cardContent: <div className=""></div>
    }
  ];

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
            onClick={() => navigate('/About')}
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
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#5A7A4D] text-center py-4">
          <button
            onClick={() => {
              navigate('/About');
              setIsMenuOpen(false);
            }}
            className="block w-full py-2 text-white hover:bg-[#446437]"
          >
            About Us
          </button>
          <button
            onClick={() => {
              handleNavigation();
              setIsMenuOpen(false);
            }}
            className="block w-full py-2 text-white hover:bg-[#446437]"
          >
            Login
          </button>
          <button
            onClick={() => {
              handleNavigation();
              setIsMenuOpen(false);
            }}
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
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative h-[75vh] w-full max-w-[100rem] rounded-xl md:rounded-lg overflow-hidden shadow-2xl"
        >
          <img src="/hero.jpg" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
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
              Pantry Assist is your meal planner and budget maintainer all in one — letting you
              focus on growing instead of tracking.
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

      <br></br>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide">
              ABOUT
            </span>
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-4">
            Everything You Need,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6d9851] to-[#5A7A4D]">
              All In One Place
            </span>
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Meal management, organized recipes, and secure grocery planning
            <br />— designed to make your life easier.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-12">
          <div className="grid grid-cols-12 gap-6 auto-rows-[260px]">
            {/* Meal Planning Card */}
            <motion.div
              className="col-span-6 lg:col-span-7 row-span-2 bg-gradient-to-br from-[#6d9851] to-[#5A7A4D] rounded-3xl p-10 shadow-2xl hover:shadow-[0_20px_60px_rgba(109,152,81,0.4)] transition-all duration-300 flex flex-col group relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-4 text-white">Meal Planning</h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  Instantly create delicious, easy to cook meals. Create new plans weekly, that all
                  fit in any grocery budget.
                </p>
              </div>

              <div className="mt-4 flex-1 flex items-end justify-center relative z-10">
                <img
                  src="/menu.png"
                  alt="Menu example"
                  className="max-h-80 rounded-2xl drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>

            {/* Cooking Help Card */}
            <motion.div
              className="col-span-12 lg:col-span-5 row-span-2 bg-gradient-to-br from-[#90c1e0] to-[#6ba5cc] rounded-3xl p-10 shadow-2xl hover:shadow-[0_20px_60px_rgba(144,193,224,0.4)] transition-all duration-300 flex flex-col group relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                ></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-4 text-white">Cooking Help</h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  Prepare and plan unique meals from around the world, featuring rich ingredients,
                  sourced by quality vendors, in an easy to use way!
                </p>
              </div>

              <div className="mt-8 flex-1 flex items-end justify-center relative z-10">
                <img
                  src="/meal.jpg"
                  alt="Meal example"
                  className="max-h-72 rounded-2xl object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </motion.div>

            {/* Grocery Planning Card */}
            <motion.div
              className="col-span-12 lg:col-span-8 row-span-1 bg-gradient-to-r from-[#f7f2e1] to-[#ede4c8] rounded-3xl p-8 shadow-2xl hover:shadow-[0_20px_60px_rgba(247,242,225,0.5)] transition-all duration-300 group border-2 border-[#d4c9a8]"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-gray-900 text-3xl font-black">Grocery Planning</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Automatically generate a grocery list, sourced from local vendors, right alongside
                your meal plan fitting perfectly within your budget.
              </p>
            </motion.div>

            {/* Analytics Card */}
            <motion.div
              className="col-span-12 lg:col-span-4 row-span-1 bg-gradient-to-br from-[#68551c] to-[#4a3c14] rounded-3xl p-8 shadow-2xl hover:shadow-[0_20px_60px_rgba(104,85,28,0.4)] transition-all duration-300 group relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-3xl text-white font-black">Analytics</h3>
                </div>
                <p className="text-white/90 text-base leading-relaxed">
                  Always know how much you've saved, spent, or eaten in calories daily — at any
                  time.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <br></br>
      <div className="h-32 w-full bg-gradient-to-b from-transparent to-[#f7faf5]" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="py-20 relative bg-gradient-to-b from-[#f7faf5] to-[#eef3e8]">
          {/* Ambient CSS Glow */}
          <div
            className="absolute inset-0 pointer-events-none 
            bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent_70%)]
            
        "
          />

          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide">
                HOW IT WORKS
              </span>
            </div>
            <h1 className="text-6xl font-black text-black mb-4">
              Get set up, <br></br> quick and easy
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 relative z-10">
            {[
              {
                img: '/icons/input.png',
                title: 'What You Input',
                desc: 'Enter your weekly budget, dietary preferences, and goals — we take it from there.'
              },
              {
                img: '/icons/delivery.png',
                title: "How It's Delivered",
                desc: 'Weekly meal plans, shopping lists, and nutrition info all in one place.'
              },
              {
                img: '/icons/benefit.png',
                title: 'Why Use It',
                desc: 'Save money, eat better, and track meals effortlessly.'
              },
              {
                img: '/icons/result.png',
                title: 'End Result',
                desc: 'Live well with balanced meals and zero stress — all for free.'
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

      <div className="text-center mb-2 mt-20">
        <div className="inline-block mb-4">
          <span className="bg-gradient-to-r from-[#6d9851] to-[#5A7A4D] text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide">
            THE PROCESS
          </span>
        </div>
        <h1 className="text-6xl font-black text-black mb-4">Up and running in minutes</h1>
      </div>
      <div className="min-h-screen bg-white text-white flex justify-center py-20 px-4">
        <div className="w-full max-w-5xl relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-8 w-px bg-gray-800" />
          <div className="space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div key={step.id} className="relative flex items-center justify-between w-full">
                  <div
                    className={`w-[45%] flex ${isEven ? 'justify-end text-right' : 'justify-start'}`}
                  >
                    {isEven ? (
                      <div>
                        <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                        <p className="text-black leading-relaxed max-w-sm ml-auto">
                          {step.description}
                        </p>
                      </div>
                    ) : (
                      step.cardContent
                    )}
                  </div>

                  {/* Absolute positioned in center to sit on top of the line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6d9851] to-[#5A7A4D] border border-gray-700 rounded-xl flex items-center justify-center shadow-lg z-10">
                      <div className="w-4 h-4 border-2 border-white/80 rounded-sm"></div>
                    </div>
                    <span className="text-xs font-mono text-black font-bold tracking-widest bg-white px-1 py-1">
                      {step.id}
                    </span>
                  </div>

                  <div
                    className={`w-[45%] flex ${isEven ? 'justify-start' : 'justify-end text-right'}`}
                  >
                    {isEven ? (
                      step.cardContent
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                        <p className="text-black leading-relaxed max-w-sm ml-auto">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ——— Mid-page CTA ——— */}
      <div className="py-20 relative text-center bg-gradient-to-t from-[#f9fbf7] to-[#f0f5ea]">
        {/* Top Glow */}
        <div
          className="absolute inset-x-0 top-0 h-40 
        bg-gradient-to-b from-white/40 to-transparent
        pointer-events-none
    "
        />

        <h2 className="text-5xl font-black text-black  mb-6 relative z-10">
          Start Saving on Groceries Today — For Free
        </h2>

        <p className="text-xl text-[#336e32]  max-w-2xl mx-auto mb-8 relative z-10">
          Build your personalized meal plan in under one minute.
        </p>

        <button
          onClick={handleNavigation}
          className="bg-[#2c5e2] bg-[#819c57] hover:bg-[#94b264] w-[220px] md:w-[250px] text-white px-10 py-4 rounded-lg font-semibold text-xl md:text-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 transition relative z-10"
        >
          Build My Plan
        </button>
      </div>

      {/* SECTION: Popular Meal Plans */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="py-20 relative bg-gradient-to-b from-[#f5f8f2] to-white"
      >
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 pointer-events-none 
        bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_75%)]
    "
        />

        <div className="text-center mb-16">
          <div className="inline-block mb-4"></div>
          <h1 className="text-6xl font-black text-black mb-4">Popular meal plans</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative z-10">
          {[
            {
              img: '/pancakes.jpg',
              title: 'Fluffy Pancakes',
              info: 'Prep Time: 15 mins | Est. Cost: $3',
              desc: 'Start your day with these delicious, easy-to-make pancakes.',
              overlay:
                'Imagine waking up to warm, fluffy pancakes — a comforting start to your day.'
            },
            {
              img: '/icons/salad.jpg',
              title: 'Quinoa Salad',
              info: 'Prep Time: 20 mins | Est. Cost: $5',
              desc: 'A refreshing salad packed with protein and fiber.',
              overlay: 'Bright, refreshing Mediterranean flavors in one bowl.'
            },
            {
              img: '/icons/stirfry.jpg',
              title: 'Chicken Stir-Fry',
              info: 'Prep Time: 25 mins | Est. Cost: $7',
              desc: 'Quick, flavorful stir-fry with chicken and veggies.',
              overlay: 'A bold, delicious stir-fry full of color and flavor.'
            }
          ].map((meal, i) => (
            <div
              key={i}
              className="
                    relative rounded-2xl overflow-hidden 
                    bg-white/20 
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

              <div
                className="absolute inset-0 bg-white/30  backdrop-blur-md 
                    flex items-center justify-center px-6
                    opacity-0 hover:opacity-100 transition duration-300 text-center
                "
              >
                <p className="text-lg font-medium text-black">{meal.overlay}</p>
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
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Recipes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/About" className="text-gray-200 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-400 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-200">
            <p>© 2025 Pantry Assist. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
