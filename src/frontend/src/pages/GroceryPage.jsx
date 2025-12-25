import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingScreen from './LoadingScreen';

const GroceryListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize state directly from location, or as an empty array.
    const [groceryList, setGroceryList] = useState(() => location.state?.grocery || []);
    const [isLoading, setIsLoading] = useState(() => !location.state?.grocery);

    useEffect(() => {
      if (groceryList === null) {
      navigate("/LoadingScreen", { state: { page: "grocery" } });
    }
    }, [groceryList, navigate]);

    useEffect(() => {
    const loadGrocery = async () => {
      setIsLoading(true);
    try {
      const response = await fetch(`/api/meals/groceryList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
    
        const seenNames = new Set();
        const uniqueList = data.filter((item) => {
          const isDuplicate = seenNames.has(item.name);
          seenNames.add(item.name);
          return !isDuplicate;
        });
        
        setGroceryList(uniqueList);
      } else {
        console.error("Failed to load grocery list:", response.status);
        setGroceryList([]);
      }
    } catch (error) {
      console.error("Error loading grocery list:", error);
      setGroceryList([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!location.state?.grocery && (!groceryList || groceryList.length === 0)) {
    loadGrocery();
  }
}, [location.state?.grocery]); 

    useEffect(() => {
    // Only run if the raw list exists and has items
    if (groceryList && groceryList.length > 0) {
      
      const seenNames = new Set();
      
      const uniqueList = groceryList.filter((item) => {
      const isDuplicate = seenNames.has(item.name);
    
        seenNames.add(item.name);
    
        return !isDuplicate;
      });

      setGroceryList(uniqueList);
    }
  }, []);

  


    // Handle case where no grocery data is available after trying to load.
    if (!groceryList || groceryList.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#6d9851] to-[#5A7A4D] flex justify-center items-center">
                <div className="text-center">
                    <p className="text-white text-xl mb-4">Your grocery list is empty.</p>
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

    // Calculate total price
    const totalPrice = groceryList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return (
    
        <div className="min-h-screen bg-gradient-to-b from-[#6d9851] to-[#5A7A4D] flex justify-center items-start p-4 sm:p-6 md:p-8">
               {isLoading && <LoadingScreen />}
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-transparent">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-[#446437]">Grocery List</h1>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 bg-[#446437] text-white rounded-lg hover:bg-[#5A7A4D] transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    {groceryList.map((item, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-4 rounded-xl shadow-md transition-shadow hover:shadow-lg">
                            <img
                                src={item.imageUrl || '/icons/groceryIcon.png'}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <div className="flex-grow ml-4">
                                <h2 className="text-xl font-semibold text-gray-800">{item.name || "Unnamed Item"}</h2>
                                <p className="text-sm text-gray-500">Servings: {item.servingsPerContainer || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-[#446437]">${(item.totalPrice || 0).toFixed(2)}</p>
                                <a
                                    href={item.productUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 px-4 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                >
                                    Buy
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-end items-center">
                    <span className="text-2xl font-semibold text-gray-600 mr-4">Total:</span>
                    <span className="text-3xl font-bold text-[#446437]">${totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default GroceryListPage;
