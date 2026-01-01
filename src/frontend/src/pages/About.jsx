import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f5f0]">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-b from-[#618c45] to-[#5A7A4D] shadow-md px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Left Side Group */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/favicon-v1.png" className="w-auto h-12 sm:h-14" alt="Logo" />
            <h2 className="text-white text-lg sm:text-xl font-semibold">Plated</h2>
          </div>
          <button
            onClick={() => handleNavigation('/landing')}
            className="bg-[#ffffff] text-[#5A7A4D] hover:bg-[#cedfc2] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md hidden md:block"
          >
            Home
          </button>
        </div>

        {/* Right Side Group */}
        <div className="flex items-center">
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('/Login')}
              className="bg-[#8abeeb] text-[#2c51b8] hover:bg-[#90c6f6] px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Login
            </button>
            <button
              onClick={() => handleNavigation('/Login')}
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
              handleNavigation('/landing');
              setIsMenuOpen(false);
            }}
            className="block w-full py-2 text-white hover:bg-[#446437]"
          >
            Home
          </button>
          <button
            onClick={() => {
              handleNavigation('/Login');
              setIsMenuOpen(false);
            }}
            className="block w-full py-2 text-white hover:bg-[#446437]"
          >
            Login
          </button>
          <button
            onClick={() => {
              handleNavigation('/Login');
              setIsMenuOpen(false);
            }}
            className="block w-full py-2 text-white hover:bg-[#446437]"
          >
            Build Plan
          </button>
        </div>
      )}
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] w-full"
      >
        <img
          src="/hero.jpg"
          alt="Healthy food ingredients"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white text-center leading-tight"
          >
            About Plated
          </motion.h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="py-20 px-4">
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl font-semibold text-[#5A7A4D] mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700">
            At Plated, the mission is to simplify your life by revolutionizing meal planning and
            pantry management. Everyone deserves to eat well without the stress of wondering what to
            cook or wasting food. Our platform empowers you to save money, reduce food waste, and
            enjoy delicious, home-cooked meals with ease.
          </p>
        </motion.section>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {[
            {
              title: 'Save Money',
              desc: 'Our smart meal planner helps you use ingredients you already have, cutting down on unnecessary grocery bills.'
            },
            {
              title: 'Eat Healthier',
              desc: 'Discover recipes tailored to your dietary needs and preferences, making healthy eating a breeze.'
            },
            {
              title: 'Reduce Waste',
              desc: "By tracking your pantry's inventory, you can minimize food spoilage and contribute to a more sustainable lifestyle."
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="p-6 rounded-2xl bg-white/600 backdrop-blur-xl border border-white/40  shadow-lg text-center"
            >
              <h3 className="text-2xl font-semibold mb-2 text-[#5A7A4D]">{card.title}</h3>
              <p className="text-base text-gray-600">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-semibold text-[#5A7A4D] mb-4">Our Story</h2>
          <p className="text-lg text-gray-700">
            Founded by a team of passionate foodies and tech enthusiasts, Plated was born from a
            simple idea: to make meal planning effortless and accessible for everyone. We were tired
            of the daily struggle of deciding what to eat and the guilt of wasting forgotten
            ingredients. We knew there had to be a better way, and so, Plated was created.
          </p>
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="bg-[#5A7A4D] text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/favicon-v1.png" className="w-10 h-10" alt="Logo" />
                <h3 className="text-xl font-semibold">Plated</h3>
              </div>
              <p className="text-sm text-gray-200">
                Plan meals, track calories, and save money effortlessly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-200 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white">
                    Recipes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/About" className="text-gray-200 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-200 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-200 hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-400 pt-6 flex justify-between items-center text-sm text-gray-200">
            <p>© 2026 Plated. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                Facebook
              </a>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
