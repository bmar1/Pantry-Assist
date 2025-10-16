import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard(mealData, groupSize, groceryList) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // clear JWT
    navigate('/login'); // redirect to login page
  };

  const handleSlideChange = (index) => {
    // Logic to change slideshow image based on index
    console.log(`Change to slide ${index}`);
  }

  return (
    //make a ejs div accepting 3 images clickable to another ejs page based on recipie
    //same logic for grocery list
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Navbar */}
      <nav className="fixed top-0 left-0 h-screen w-60 bg-[#87AE73] text-white flex flex-col p-4">
        {/* Main nav links */}
        <div className="flex flex-col space-y-4 flex-grow">
          <a
            href="#"
            className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded font-medium"
          >
            <img src="/icons/home.png" alt="Home" className="w-5 h-5" />
            Home
          </a>

          <a
            href="#"
            className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded font-medium"
          >
            <img src="/icons/recipes.png" alt="Recipes" className="w-5 h-5" />
            Your Recipes
          </a>

          <a
            href="grocery"
            className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded font-medium"
          >
            <img src="/icons/groceryIcon.png" alt="Grocery" className="w-8 h-8 " />
            Grocery List
          </a>

          <a
            href="#"
            className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded font-medium"
          >
            <img src="/icons/settings.png" alt="Settings" className="w-5 h-5" />
            Settings
          </a>
        </div>

        <div className="mt-auto">
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 hover:bg-[#94bf7f] p-2 rounded font-medium"
          >
            <img src="/icons/logout.png" alt="Logout" className="w -5 h-5" />
            Log out
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-center ml-60 p-8">
        <h1 className="text-2xl font-semibold mb-4 self-start">Your planned meals:</h1>

        <div className="w-full max-w-xl bg-[#d8f0db] p-4 rounded-xl shadow-md flex flex-col items-center">
          {/* Slideshow image */}
          <img
            src="/images/pancakes.jpg"
            alt="Meal"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />

          {/* Dots */}
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot, i) => (
              <button
                key={i}
                onClick={() => handleSlideChange(i)}
                className="w-3 h-3 rounded-full bg-white hover:bg-gray-300"
              />
            ))}
          </div>
        </div>


      </main>

      <div className="bg-gray-200 w-40 h-40 p-4 rounded-md shadow-md">
        <h2 className="font-semibold mb-2 text-center">Grocery List</h2>
        <div className="flex justify-between">
          <span>Avocado</span>
          <span>$2.50</span>
        </div>
      </div>




    </div >
  );
}
